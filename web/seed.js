const API_BASE = 'http://127.0.0.1:3000/api';

const restaurants = [
    {
        name: "Hummus Shop",
        address: "Ben Yehuda St 50, Tel Aviv-Yafo",
        description: "Freshly made hummus and falafel every day",
        latitude: 32.0805, longitude: 34.7702,
        products: [
            { name: "Hummus Plate", description: "Classic hummus with olive oil and chickpeas", price: 12.99 },
            { name: "Falafel Portion", description: "6 crispy falafel balls with tahini", price: 10.99 },
            { name: "Fresh Pita", description: "Warm pita bread straight from the oven", price: 5.99 }
        ]
    },
    {
        name: "Hamburger Joint",
        address: "Dizengoff St 100, Tel Aviv-Yafo",
        description: "Classic American style burgers (100% Kosher Beef)",
        latitude: 32.0815, longitude: 34.7738,
        products: [
            { name: "Classic Beef Burger", description: "200g beef patty with lettuce, tomato, and pickles", price: 15.99 },
            { name: "French Fries", description: "Crispy golden potato fries", price: 4.99 },
            { name: "Onion Rings", description: "Fried battered onion rings", price: 3.99 }
        ]
    },
    {
        name: "Pizza Place",
        address: "Allenby St 70, Tel Aviv-Yafo",
        description: "Hot, cheesy, and delicious slices",
        latitude: 32.0673, longitude: 34.7725,
        products: [
            { name: "Margherita Pizza", description: "Classic tomato sauce and mozzarella cheese", price: 12.99 },
            { name: "Olive Pizza", description: "Margherita topped with green and black olives", price: 14.99 },
            { name: "Garlic Bread", description: "Oven-baked bread with garlic butter", price: 6.99 }
        ]
    },
    {
        name: "Ice Cream Parlor",
        address: "Rothschild Blvd 30, Tel Aviv-Yafo",
        description: "Sweet and refreshing ice cream",
        latitude: 32.0624, longitude: 34.7719,
        products: [
            { name: "Vanilla Cone", description: "Classic vanilla ice cream in a crispy cone", price: 3.99 },
            { name: "Chocolate Scoop", description: "Rich chocolate ice cream", price: 4.99 },
            { name: "Strawberry Milkshake", description: "Creamy blended strawberry shake", price: 5.99 }
        ]
    },
    {
        name: "Salad Bar",
        address: "Ibn Gabirol St 40, Tel Aviv-Yafo",
        description: "Healthy and fresh custom salads",
        latitude: 32.0735, longitude: 34.7820,
        products: [
            { name: "Greek Salad", description: "Tomatoes, cucumbers, red onions, olives, and feta cheese", price: 10.99 },
            { name: "Quinoa Bowl", description: "Quinoa, sweet potato, and fresh greens", price: 12.99 },
            { name: "Fresh Lemonade", description: "Cold squeezed lemonade with mint", price: 3.99 }
        ]
    }
];

async function seed() {
    console.log('Starting seed process...');

    for (let i = 0; i < restaurants.length; i++) {
        const restData = restaurants[i];
        try {
            // 1. Create an owner user for this restaurant
            const uniqueSuffix = Date.now().toString().slice(-4) + i;
            const uniqueUsername = `owner_${uniqueSuffix}`;

            const formData = new FormData();
            formData.append('username', uniqueUsername);
            formData.append('password', 'password');
            formData.append('name', `${restData.name} Owner`);
            formData.append('phone', '123456789');
            formData.append('latitude', '32.0');
            formData.append('longitude', '34.0');
            formData.append('isOwner', 'true');
            formData.append('logo', new Blob(['dummy'], { type: 'image/png' }), 'logo.png');

            const userRes = await fetch(`${API_BASE}/users`, {
                method: 'POST',
                body: formData
            });

            if (!userRes.ok && userRes.status !== 409) {
                console.error(`Failed to create user for ${restData.name}:`, await userRes.text());
                continue;
            }

            // 2. Login to get token
            const loginRes = await fetch(`${API_BASE}/tokens`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username: uniqueUsername, password: 'password' })
            });

            if (!loginRes.ok) {
                console.error(`Failed to login for ${restData.name}:`, await loginRes.text());
                continue;
            }

            const tokenData = await loginRes.json();
            const token = tokenData.token;

            // 3. Get the auto-created Restaurant
            const myRestRes = await fetch(`${API_BASE}/restaurants/my`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!myRestRes.ok) {
                console.error(`Failed to get my restaurant for ${restData.name}:`, await myRestRes.text());
                continue;
            }

            const myRestData = await myRestRes.json();
            const restId = myRestData.id;

            // 3.5 Update the Restaurant with seed data
            const restBody = {
                name: restData.name,
                description: restData.description,
                location: {
                    latitude: restData.latitude,
                    longitude: restData.longitude
                }
            };

            const updateRestRes = await fetch(`${API_BASE}/restaurants/${restId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(restBody)
            });

            if (!updateRestRes.ok) {
                console.error(`Failed to update restaurant ${restBody.name}:`, await updateRestRes.text());
                continue;
            }

            console.log(`Updated restaurant: ${restBody.name} (ID: ${restId})`);

            // 4. Create Products
            for (const prodBody of restData.products) {
                const prodRes = await fetch(`${API_BASE}/restaurants/${restId}/products`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(prodBody)
                });

                if (!prodRes.ok) {
                    console.error(`Failed to create product ${prodBody.name}:`, await prodRes.text());
                    continue;
                }

                const createdProd = await prodRes.json();
                console.log(`Created product: ${createdProd.result.name}`);
            }
        } catch (err) {
            console.error(`Error processing ${restData.name}:`, err.message);
        }
    }

    console.log('\nSeed process completed! Check your Home page to see the new data.');
}

seed();
