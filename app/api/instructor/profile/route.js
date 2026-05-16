import dbConnect from '@/dbConnect';
import User from '@/models/User';
import Instructor from '@/models/Instructor';
import Course from '@/models/Course';
import {
  instructorAuthMiddleware,
  errorResponse,
  successResponse,
} from '@/middleware/instructor';

export async function GET(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const instructorId = authResult.user.id;

    const user = await User.findById(instructorId).select('name email').lean();
    if (!user) return errorResponse('User not found', 'NOT_FOUND', 404);

    let instructorProfile = await Instructor.findOne({ userId: instructorId }).lean();
    
    // If no instructor profile exists yet, return empty defaults
    if (!instructorProfile) {
      instructorProfile = {
        department: "Computer Science",
        courses: 0,
        students: 0,
        phone: "",
        address: "",
        designation: "Instructor",
        specialization: "",
        joinDate: new Date(),
        publications: 0,
        qualifications: []
      };
    }

    // Dynamic stats
    const courses = await Course.find({ instructor: instructorId }).lean();
    const activeCourses = courses.length;
    const totalStudents = courses.reduce((sum, c) => sum + (c.students || 0), 0);

    const profileData = {
      id: instructorId,
      name: user.name,
      email: user.email,
      phone: instructorProfile.phone || "",
      address: instructorProfile.address || "",
      joinDate: new Date(instructorProfile.joinDate || Date.now()).toLocaleDateString(),
      department: instructorProfile.department || "Computer Science",
      designation: instructorProfile.designation || "Instructor",
      specialization: instructorProfile.specialization || "General",
      qualifications: instructorProfile.qualifications && instructorProfile.qualifications.length > 0 
        ? instructorProfile.qualifications 
        : [
            { degree: "BS Computer Science", institution: "University", year: "2015" }
          ],
      courses: activeCourses,
      totalStudents: totalStudents,
      publications: instructorProfile.publications || 0,
      avatar: null
    };

    return successResponse(profileData, 'Instructor profile retrieved successfully');
  } catch (error) {
    console.error('Profile API Error:', error);
    return errorResponse('Failed to retrieve profile', 'SERVER_ERROR', 500);
  }
}

export async function PUT(req) {
  try {
    const authResult = await instructorAuthMiddleware(req);
    if (!authResult.success) {
      return errorResponse(authResult.message, authResult.error, authResult.status);
    }

    await dbConnect();
    const instructorId = authResult.user.id;
    const updateData = await req.json();

    // 1. Update User Details if changed
    const userUpdate = {};
    if (updateData.email) userUpdate.email = updateData.email;
    if (updateData.name) userUpdate.name = updateData.name;

    if (Object.keys(userUpdate).length > 0) {
      await User.findByIdAndUpdate(instructorId, userUpdate);
    }

    // 2. Update Instructor Document
    const instructorUpdate = {
      phone: updateData.phone,
      address: updateData.address,
      specialization: updateData.specialization
    };

    const updatedProfile = await Instructor.findOneAndUpdate(
      { userId: instructorId },
      { $set: instructorUpdate },
      { new: true, upsert: true }
    );

    return successResponse(updatedProfile, 'Profile updated successfully');
  } catch (error) {
    console.error('Profile Update API Error:', error);
    return errorResponse('Failed to update profile', 'SERVER_ERROR', 500);
  }
}
