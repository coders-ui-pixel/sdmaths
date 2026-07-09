require('dotenv').config();

async function test() {
  try {
    const { prisma } = require("./lib/prisma");
    const courses = await prisma.course.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true, title: true, slug: true, description: true,
        price: true, thumbnail: true,
        discountAmount: true, discountLimit: true,
        _count: {
          select: {
            playlists: true,
            mcqExams: true,
            payments: { where: { status: "VERIFIED" } }
          }
        }
      }
    });
    console.log("Success:", courses.length, "courses");
  } catch (error) {
    console.error("Error querying courses:", error);
  } finally {
    process.exit(0);
  }
}

test();
