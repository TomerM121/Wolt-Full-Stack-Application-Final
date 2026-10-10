const usersRepository = require('../repositories/usersRepository');
const viewService = require('./viewService');

/*
 * Create a new web user.
 */
async function createUser(data, logoPath) {
    if (
        !data.username ||
        !data.password ||
        !data.name ||
        !data.phone ||
        data.latitude === undefined ||
        data.longitude === undefined ||
        !logoPath
    ) {
        return {
            status: 400,
            body: {
                error: 'username, password, name, phone, location and logo are required'
            }
        };
    }

    if (await usersRepository.existsByUsername(data.username)) {
        return {
            status: 409,
            body: {
                error: 'Username already exists'
            }
        };
    }

    // Convert isOwner to a boolean value
    const isOwner =
        data.isOwner === 'true' ||
        data.isOwner === true;

    const user = await usersRepository.create({
        username: data.username,
        password: data.password,
        name: data.name,
        phone: data.phone,
        location: {
            latitude: Number(data.latitude),
            longitude: Number(data.longitude)
        },
        logo: logoPath,
        isOwner
    });

    try {
        await viewService.initUser(user.id);
    } catch (err) {
        console.error(
            'Failed to initialize user on ex2 server:',
            err.message
        );
    }

    // If the user is an owner, create a default restaurant for them.
    if (isOwner) {
        const restaurantMap =
            require('../repositories/restaurantMap');
        const restaurantsRepository =
            require('../repositories/restaurantsRepository');

        const defaultRestaurant =
            await restaurantsRepository.createRestaurant({
                name: `${user.name}'s Restaurant`,
                description: 'Welcome to my new restaurant!',
                location: {
                    latitude: user.location.latitude,
                    longitude: user.location.longitude
                },
                ownerId: user.id    // persisted to MongoDB for restart recovery
            });

        restaurantMap.setRestaurantId(
            user.id,
            defaultRestaurant.id
        );
    }

    // Return the created user details (excluding password) with a 201 status code and location header.
    return {
        status: 201,
        body: {
            id: user.id,
            username: user.username,
            name: user.name,
            phone: user.phone,
            logo: user.logo,
            location: user.location,
            isOwner: user.isOwner
        },
        location: `/api/users/${user.id}`
    };
}

/*
 * Get user details by id.
 */
async function getUserById(id) {
    const user = await usersRepository.getById(id);

    if (!user) {
        return {
            status: 404,
            body: {
                error: 'User not found'
            }
        };
    }

    return {
        status: 200,
        body: {
            id: user.id,
            username: user.username,
            name: user.name,
            phone: user.phone,
            location: user.location,
            logo: user.logo,
            isOwner: user.isOwner
        }
    };
}

module.exports = {
    createUser,
    getUserById
};