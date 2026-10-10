import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import auth from '../../../shared/api/auth.js';
import restaurantApi from '../../../shared/api/restaurant.js';
import jwtHelper from '../../../shared/services/JwtHelper';

const OwnerView = () => {
    // --- State Management ---
    const [restaurant, setRestaurant] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    
    // View Toggles
    const [isEditing, setIsEditing] = useState(false);
    const [isAddingProduct, setIsAddingProduct] = useState(false);
    const [editingProductId, setEditingProductId] = useState(null); // ID of the product currently being edited
    
    const navigate = useNavigate();

    // Form States
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        latitude: '',
        longitude: ''
    });

    const [editData, setEditData] = useState({
        name: '',
        description: '',
        latitude: '',
        longitude: ''
    });

    const [productData, setProductData] = useState({
        name: '',
        description: '',
        price: ''
    });

    const [editProductData, setEditProductData] = useState({
        name: '',
        description: '',
        price: ''
    });

    // --- Lifecycle & Auth ---
    useEffect(() => {
        const checkOwnerStatus = async () => {
            try {
                if (!(await jwtHelper.isLoggedIn())) {
                    navigate('/login');
                    return;
                }

                const userDetails = await auth.getUser();
                if (!userDetails) {
                    setError('Access Denied: No details found.');
                    setIsLoading(false);
                    return;
                }
                
                if (!userDetails.isOwner) {
                    setError('Access Denied: You are not a restaurant owner.');
                    setIsLoading(false);
                    return;
                }
                        
                await fetchRestaurantDetails();

            } catch(err) {
                console.error("Authentication failed:", err.message);
                navigate('/login');
            }
        }
        checkOwnerStatus();
    }, [navigate]);

    const fetchRestaurantDetails = async () => {
        try {
            const data = await restaurantApi.getMyRestaurant(); 
            setRestaurant(data);
        } catch (err) {
            console.log("No restaurant found. Showing creation form.");
            setRestaurant(null);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Handlers: Create Restaurant ---
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        try {
            const newRestaurant = {
                name: formData.name,
                description: formData.description,
                location: {
                    latitude: Number(formData.latitude),
                    longitude: Number(formData.longitude)
                }
            };
            
            await restaurantApi.createRestaurant(newRestaurant);
            setIsLoading(true);
            await fetchRestaurantDetails();
        } catch (err) {
            setError('Failed to create restaurant: ' + err.message);
        }
    };

    // --- Handlers: Edit Details ---
    const handleStartEditing = () => {
        setEditData({
            name: restaurant.name,
            description: restaurant.description,
            latitude: restaurant.location?.latitude || '',
            longitude: restaurant.location?.longitude || ''
        });
        setIsEditing(true);
    };

    const handleEditSubmit = async (e) => {
        e.preventDefault();
        try {
            setIsLoading(true);
            const updatedRestaurant = {
                name: editData.name,
                description: editData.description,
                location: {
                    latitude: Number(editData.latitude),
                    longitude: Number(editData.longitude)
                }
            };

            await restaurantApi.updateRestaurant(restaurant.id, updatedRestaurant);
            await fetchRestaurantDetails();
            setIsEditing(false); 
        } catch (err) {
            setError('Failed to update restaurant: ' + err.message);
            setIsLoading(false);
        }
    };

    // --- Handlers: Products (Add/Delete/Update) ---
    const handleAddProductSubmit = async (e) => {
        e.preventDefault();

        // Client-side price validation — avoids a round-trip 400 from the backend
        const priceNum = Number(productData.price);
        if (productData.price === '' || isNaN(priceNum) || priceNum < 0) {
            setError('Please enter a valid price (must be 0 or greater).');
            return;
        }

        try {
            setIsLoading(true);
            setError('');
            await restaurantApi.addProduct(restaurant.id, {
                name: productData.name,
                description: productData.description,
                price: priceNum
            });
            setProductData({ name: '', description: '', price: '' });
            setIsAddingProduct(false);
            await fetchRestaurantDetails();
        } catch (err) {
            setError('Failed to add product: ' + err.message);
            setIsLoading(false);
        }
    };

    const handleDeleteProduct = async (productId) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            setIsLoading(true);
            await restaurantApi.deleteProduct(restaurant.id, productId);
            await fetchRestaurantDetails();
        } catch (err) {
            setError('Failed to delete product: ' + err.message);
            setIsLoading(false);
        }
    };

    const startEditProduct = (product) => {
        setEditingProductId(product.id);
        setEditProductData({
            name: product.name,
            description: product.description,
            price: product.price !== undefined ? String(product.price) : ''
        });
    };

    const handleUpdateProduct = async (productId) => {
        // Client-side price validation
        if (editProductData.price !== undefined && editProductData.price !== '') {
            const priceNum = Number(editProductData.price);
            if (isNaN(priceNum) || priceNum < 0) {
                setError('Please enter a valid price (must be 0 or greater).');
                return;
            }
        }
        try {
            setIsLoading(true);
            setError('');
            const payload = {
                name: editProductData.name,
                description: editProductData.description,
                ...(editProductData.price !== '' && { price: Number(editProductData.price) })
            };
            await restaurantApi.updateProduct(restaurant.id, productId, payload);
            setEditingProductId(null);
            await fetchRestaurantDetails();
        } catch (err) {
            setError('Failed to update product: ' + err.message);
            setIsLoading(false);
        }
    };

    // --- Handlers: Delete Restaurant ---
    const handleCloseRestaurant = async () => {
        const isConfirmed = window.confirm("Are you sure you want to close your restaurant? This action cannot be undone.");
        if (!isConfirmed) return;

        try {
            setIsLoading(true);
            await restaurantApi.deleteRestaurant(restaurant.id);
            setRestaurant(null);
        } catch (err) {
            setError('Failed to delete restaurant: ' + err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // --- Render Logic ---
    if (isLoading) return <div>Loading your dashboard...</div>;
    if (error) return <div className="error-container"><h2>{error}</h2></div>;

    // View 1: Creation Form
    if (!restaurant) {
        return (
            <div className="create-restaurant-container">
                <h2>Welcome! Let's set up your new restaurant.</h2>
                <form onSubmit={handleCreateSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                    <input type="text" placeholder="Restaurant Name" required
                        onChange={e => setFormData({...formData, name: e.target.value})} />
                    <textarea placeholder="Description" required
                        onChange={e => setFormData({...formData, description: e.target.value})} />
                    <input type="number" step="any" placeholder="Latitude" required
                        onChange={e => setFormData({...formData, latitude: e.target.value})} />
                    <input type="number" step="any" placeholder="Longitude" required
                        onChange={e => setFormData({...formData, longitude: e.target.value})} />
                    <button type="submit">Create My Restaurant</button>
                </form>
            </div>
        );
    }

    // View 2: Edit Details Form
    if (isEditing) {
        return (
            <div className="edit-restaurant-container">
                <h2>Edit Restaurant Details</h2>
                <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                    <label>Name:</label>
                    <input type="text" value={editData.name} required
                        onChange={e => setEditData({...editData, name: e.target.value})} />
                    <label>Description:</label>
                    <textarea value={editData.description} required
                        onChange={e => setEditData({...editData, description: e.target.value})} />
                    <label>Latitude:</label>
                    <input type="number" step="any" value={editData.latitude} required
                        onChange={e => setEditData({...editData, latitude: e.target.value})} />
                    <label>Longitude:</label>
                    <input type="number" step="any" value={editData.longitude} required
                        onChange={e => setEditData({...editData, longitude: e.target.value})} />
                    
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" style={{ backgroundColor: 'green', color: 'white' }}>Save Changes</button>
                        <button type="button" onClick={() => setIsEditing(false)}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    // View 3: Add Product Form
    if (isAddingProduct) {
        return (
            <div className="add-product-container">
                <h2>Add New Product</h2>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <form onSubmit={handleAddProductSubmit} style={{ display: 'flex', flexDirection: 'column', width: '300px', gap: '10px' }}>
                    <input type="text" placeholder="Product Name" required value={productData.name}
                        onChange={e => setProductData({...productData, name: e.target.value})} />
                    <textarea placeholder="Description" required value={productData.description}
                        onChange={e => setProductData({...productData, description: e.target.value})} />
                    <input
                        type="number"
                        placeholder="Price (e.g. 9.99)"
                        required
                        min="0"
                        step="0.01"
                        value={productData.price}
                        onChange={e => setProductData({...productData, price: e.target.value})}
                    />
                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <button type="submit" style={{ backgroundColor: 'green', color: 'white' }}>Save Product</button>
                        <button type="button" onClick={() => { setIsAddingProduct(false); setError(''); }}>Cancel</button>
                    </div>
                </form>
            </div>
        );
    }

    // View 4: Standard Management Dashboard
    return (
        <div className="owner-container">
            <h1>Manage: {restaurant.name}</h1>
            <p><strong>Description:</strong> {restaurant.description}</p>
            <p><strong>Location:</strong> {restaurant.location?.latitude}, {restaurant.location?.longitude}</p>
            
            <hr />

            <div className="menu-section">
                <h2>Menu</h2>
                {!restaurant.products || restaurant.products.length === 0 ? (
                    <p style={{ fontStyle: 'italic', color: 'gray' }}>The menu is empty.</p>
                ) : (
                    <ul style={{ listStyleType: 'none', padding: 0 }}>
                        {restaurant.products.map(product => (
                            <li key={product.id} style={{ borderBottom: '1px solid #ccc', padding: '10px 0' }}>
                                {editingProductId === product.id ? (
                                // Edit mode for this specific product
                                <form 
                                    onSubmit={(e) => { 
                                        e.preventDefault(); 
                                        handleUpdateProduct(product.id); 
                                    }} 
                                    style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}
                                >
                                    <input 
                                        value={editProductData.name} 
                                        required 
                                        onChange={e => setEditProductData({...editProductData, name: e.target.value})} 
                                    />
                                    <textarea 
                                        value={editProductData.description} 
                                        required 
                                        onChange={e => setEditProductData({...editProductData, description: e.target.value})} 
                                    />
                                    <input
                                        type="number"
                                        placeholder="Price"
                                        min="0"
                                        step="0.01"
                                        value={editProductData.price}
                                        onChange={e => setEditProductData({...editProductData, price: e.target.value})}
                                    />
                                    <button type="submit">Save Update</button>
                                    <button type="button" onClick={() => setEditingProductId(null)}>Cancel</button>
                                </form>
                                ) : (
                                    // View mode
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <strong>{product.name}</strong>
                                            <br />
                                            <span style={{ fontSize: '0.9em', color: '#555' }}>{product.description}</span>
                                            {product.price !== undefined && (
                                                <span style={{ display: 'block', fontSize: '0.9em', color: '#222', marginTop: '2px' }}>
                                                    ${Number(product.price).toFixed(2)}
                                                </span>
                                            )}
                                        </div>
                                        <div style={{ display: 'flex', gap: '5px' }}>
                                            <button onClick={() => startEditProduct(product)}>Edit</button>
                                            <button onClick={() => handleDeleteProduct(product.id)} style={{ backgroundColor: 'red', color: 'white' }}>Delete</button>
                                        </div>
                                    </div>
                                )}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <hr />

            <div className="admin-actions" style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button onClick={() => setIsAddingProduct(true)}>Add Product</button>
                <button onClick={handleStartEditing}>Edit Restaurant Details</button>
                <button onClick={handleCloseRestaurant} style={{backgroundColor: 'red', color: 'white'}}>Close Restaurant</button>
            </div>
        </div>
    );
};

export default OwnerView;