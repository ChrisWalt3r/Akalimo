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

    // ... existing category seeding ...

    console.log('Seeding Providers...');
    const providerData = [
        { name: 'John Doe Repairs', role: 'SERVICE_PROVIDER', phone: '254700000001', category: 'Technical Services', lat: -1.2921, lng: 36.8219 }, // CBD
        { name: 'Alice Plumber', role: 'SERVICE_PROVIDER', phone: '254700000002', category: 'Technical Services', lat: -1.2800, lng: 36.8100 }, // Westlands
        { name: 'Bob Electrician', role: 'SERVICE_PROVIDER', phone: '254700000003', category: 'Technical Services', lat: -1.3000, lng: 36.8500 }, // Industrial Area
        { name: 'Sarah Stylist', role: 'SERVICE_PROVIDER', phone: '254700000004', category: 'Beauty & Health', lat: -1.2600, lng: 36.8000 }, // Kileleshwa
        { name: 'Mike Carpenter', role: 'SERVICE_PROVIDER', phone: '254700000005', category: 'Furniture & Decoration', lat: -1.3100, lng: 36.8300 } // South C
    ];

    for (const p of providerData) {
        // Create User
        const user = await prisma.user.upsert({
            where: { phone: p.phone },
            update: {},
            create: {
                phone: p.phone,
                password: 'password123', // Dummy password
                role: 'SERVICE_PROVIDER',
                accessCode: '123456',
                profile: {
                    create: {
                        fullName: p.name,
                        latitude: p.lat,
                        longitude: p.lng,
                        location: 'Nairobi',
                    }
                }
            },
            include: { profile: true }
        });

        // Link Provider to a Service in their Category
        // First find the category
        const cat = await prisma.category.findUnique({ where: { name: p.category } });
        if (cat && user.profile) {
            // Create a specific service offering for this provider
            await prisma.service.create({
                data: {
                    name: `${p.name} - Standard Service`,
                    description: `Professional service by ${p.name}`,
                    price: 2500,
                    categoryId: cat.id,
                    profileId: user.profile.id
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
