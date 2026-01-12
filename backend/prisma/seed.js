const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
    {
        name: 'Technical Services',
        services: [
            'Automotive Mechanics',
            'Electrician (Repairs)',
            'Electrician (Installations)',
            'Plumbing (Repairs)',
            'Plumbing (Installations)',
            'Fabrication',
            'Sewer Unblocking'
        ]
    },
    {
        name: 'Beauty & Health',
        services: [
            'Hair Dressing (Women)',
            'Hair Cut (Men)',
            'Manicure & Pedicure',
            'Massage',
            'Personal Trainer'
        ]
    },
    {
        name: 'Furniture & Decoration',
        services: [
            'Sofa Repair',
            'Sofa Design',
            'Table Repair',
            'Custom Shelves',
            'Foam Replacement'
        ]
    },
    {
        name: 'Home Management',
        services: [
            'Cleaning',
            'Catering',
            'Laundry'
        ]
    },
    {
        name: 'Fashion & Design',
        services: [
            'Tailoring',
            'Fashion Design'
        ]
    },
    {
        name: 'Building & Construction',
        services: [
            'Masonry',
            'Painting',
            'Roofing'
        ]
    }
];

async function main() {
    console.log('Start seeding...');

    for (const cat of categories) {
        const category = await prisma.category.upsert({
            where: { name: cat.name },
            update: {},
            create: {
                name: cat.name,
            },
        });

        for (const servName of cat.services) {
            await prisma.service.create({
                data: {
                    name: servName,
                    categoryId: category.id,
                    description: `Professional ${servName} services`,
                    price: 0 // Default price
                }
            });
        }
    }

    console.log('Seeding finished.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
