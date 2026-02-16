import prisma from "../config/prisma.js";
import supabase from "../utils/supabase.js";
// import { __dirname } from "../middlewares/upload.js";

function generateRandom4DigitNumber() {
  return Math.floor(Math.random() * 9000) + 1000;
}

function generateUserId(lastId) {
  if (!lastId) return "ALMB00001"; // No user found

  const numberPart = parseInt(lastId.replace("ALMB", ""), 10); // Extract number
  const nextNumber = numberPart + 1;
  return `ALMB${String(nextNumber).padStart(5, "0")}`;
}
class MemberService {
  // Create new member
 async createMember(memberData, files, createdBy) {
  try {
    let documentJson = [];

    // 🔥 Upload files to Supabase if provided
    if (files && files.length > 0) {

      for (const file of files) {

        const fileExt = file.mimetype.split("/")[1];
        const fileName = `members/${Date.now()}-${Math.random()
          .toString(36)
          .substring(2)}.${fileExt}`;

        const { error } = await supabase.storage
          .from("member-document") 
          .upload(fileName, file.buffer, {
            contentType: file.mimetype,
          });

        if (error) {
          throw new Error(`Supabase upload failed: ${error.message}`);
        }

        const { data } = supabase.storage
          .from("member-document")
          .getPublicUrl(fileName);

        documentJson.push({
          originalName: file.originalname,
          url: data.publicUrl,
          mimetype: file.mimetype,
          size: file.size,
        });
      }
    }

    // 🔥 Generate new user ID
    const lastUser = await prisma.user.findFirst({
      where: {
        id: { startsWith: "ALMB" },
      },
      orderBy: {
        id: "desc",
      },
    });

    const newUserId = generateUserId(lastUser?.id);

    // 🔥 Create user
    const user = await prisma.user.create({
      data: {
        id: newUserId,
        email:
          memberData.name + generateRandom4DigitNumber() + "@almubarak.com",
        name: memberData.name,
        password: "almubarak123",
        role: "MEMBER",
      },
    });

    const { userCreated, ...memberRecord } = memberData;

    // 🔥 Create member
    const member = await prisma.member.create({
      data: {
        id: newUserId,
        ...memberRecord,
        userid: user.id,
        createdById: createdBy.userId,
        document: documentJson,
        extra: memberRecord.extra || {},
      },
    });

    return member;

  } catch (error) {
    throw new Error(`Error creating member: ${error.message}`);
  }
}
  // Get all members with pagination
  async getAllMembers(page = 1, limit = 10, filters = {}) {
    try {
      const skip = (page - 1) * limit;
      const where = {};

      // Apply filters
      if (filters.name) {
        where.name = { contains: filters.name, mode: "insensitive" };
      }
      if (filters.mobileNo) {
        where.mobileNo = { contains: filters.mobileNo };
      }
      if (filters.userid) {
        where.userid = filters.userid;
      }
      if (filters.createdById) {
        where.createdById = filters.createdById;
      }

      const [members, total] = await Promise.all([
        prisma.member.findMany({
          where,
          skip,
          take: Number(limit),
          include: {
            user: {
              select: { id: true, email: true, name: true },
            },
            createdBy: {
              select: { id: true, email: true, name: true },
            },
            TourMember: true,
          },
          orderBy: { createdAt: "desc" },
        }),
        prisma.member.count({ where }),
      ]);

      return {
        data: members,
        total,
        pageSize: Number(limit),
      };
    } catch (error) {
      throw new Error(`Error fetching members: ${error.message}`);
    }
  }

  // Get member by ID
  async getMemberById(id) {
    try {
      const member = await prisma.member.findUnique({
        where: { id },
        include: {
          user: true,
          TourMember: {
            include: {
              tour: true,
            },
          },
        },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      return member;
    } catch (error) {
      throw new Error(`Error fetching member: ${error.message}`);
    }
  }

  // Update member
  async updateMember(id, updateData, files, createdBy) {
    try {
      const existingMember = await prisma.member.findUnique({
        where: { id },
      });

      if (!existingMember) {
        throw new Error("Member not found");
      }

      // Handle document updates
      let documentJson = existingMember.document;

      console.log("document json", documentJson);
      if (files && files.length > 0) {
        const newDocuments = files.map((file) => ({
          filename: file.filename,
          originalName: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
        }));

        // Merge with existing documents or replace
        documentJson = updateData.replaceDocuments
          ? newDocuments
          : [...(existingMember.document || []), ...newDocuments];
      }

      const { user, replaceDocuments, ...memberRecord } = updateData;
      const member = await prisma.member.update({
        where: { id },
        data: {
          ...memberRecord,
          document: documentJson,
          extra: memberRecord.extra || existingMember.extra,
          createdById: createdBy.userId,
        },
      });

      return member;
    } catch (error) {
      throw new Error(`Error updating member: ${error.message}`);
    }
  }

  // Delete member
  async deleteMember(id) {
    try {
      const member = await prisma.member.findUnique({
        where: { id },
      });

      if (!member) {
        throw new Error("Member not found");
      }

      await prisma.member.delete({
        where: { id },
      });

      return { message: "Member deleted successfully" };
    } catch (error) {
      throw new Error(`Error deleting member: ${error.message}`);
    }
  }

  // Get members by user ID
  async getMembersByUserId(userid) {
    try {
      const members = await prisma.member.findMany({
        where: { userid },
        include: {
          TourMember: {
            include: {
              tour: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      return members;
    } catch (error) {
      throw new Error(`Error fetching user members: ${error.message}`);
    }
  }
}

export default new MemberService();
