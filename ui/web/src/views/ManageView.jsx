import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import restaurantApi from '../../../shared/api/restaurant';
import productApi from '../../../shared/api/product';
import './ManageView.css';

// This is the restaurant management screen, accessed via /manage/:restaurantId
export default function ManageView() {
    const { restaurantId } = useParams();
    const navigate = useNavigate();

    // The restaurant object and its product list
    const [restaurant, setRestaurant] = useState(null);
    const [menu, setMenu] = useState([]);
    const [pageError, setPageError] = useState(null);

    // Each section has its own message state for success/error feedback
    const [addMsg, setAddMsg] = useState('');
    const [editProductMsg, setEditProductMsg] = useState('');
    const [removeProductMsg, setRemoveProductMsg] = useState('');
    const [editRestaurantMsg, setEditRestaurantMsg] = useState('');
    const [closeMsg, setCloseMsg] = useState('');

    // Each section has its own loading state to disable the button during an API call
    const [isAdding, setIsAdding] = useState(false);
    const [isEditingProduct, setIsEditingProduct] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [isEditingRestaurant, setIsEditingRestaurant] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    // Form state for each section
    const [addForm, setAddForm] = useState({ name: '', description: '' });
    const [editProductForm, setEditProductForm] = useState({ productId: '', name: '', description: '' });
    const [removeProductId, setRemoveProductId] = useState('');
    const [editRestaurantForm, setEditRestaurantForm] = useState({ name: '' });

    // useRef to ensure we fetch only once
    const hasFetched = useRef(false);

    // Fetch the restaurant details and its menu when the page loads
    useEffect(() => {
        if (hasFetched.current) return;
        hasFetched.current = true;

        const fetchData = async () => {
            try {
                // Fetch the logged-in user's restaurant to verify ownership
                let myRest = null;
                try {
                    myRest = await restaurantApi.getMyRestaurant();
                } catch (err) {
                    // They might not have a restaurant or aren't logged in
                }

                // If they don't own the restaurant matching the URL, block access
                if (!myRest || String(myRest.id) !== String(restaurantId)) {
                    setPageError('Access Denied: You are not the manager of this restaurant.');
                    return;
                }

                // Fetch both at the same time to save time
                const [rest, menuItems] = await Promise.all([
                    restaurantApi.getRestaurantById(restaurantId),
                    productApi.getMenu(restaurantId)
                ]);
                setRestaurant(rest.data || rest);
                setMenu(menuItems || []);

                // Fill the edit restaurant form with the current name so the user sees what they are editing
                setEditRestaurantForm({ name: (rest.data || rest).name || '' });
            } catch (err) {
                setPageError('Failed to load restaurant data.');
            }
        };

        fetchData();
    }, [restaurantId]);

    // Re-fetch the menu after any product change so the dropdowns stay up to date
    const refreshMenu = async () => {
        try {
            const menuItems = await productApi.getMenu(restaurantId);
            setMenu(menuItems || []);
        } catch {
            // Not critical, the page will still work with the old list
        }
    };

    // Add a new product to this restaurant
    const handleAddProduct = async (e) => {
        e.preventDefault();

        // Make sure name is not empty
        if (!addForm.name.trim()) {
            setAddMsg('error:Product name is required.');
            return;
        }

        setIsAdding(true);
        setAddMsg('');

        try {
            await productApi.addProduct(restaurantId, addForm.name.trim(), addForm.description.trim());
            setAddMsg('success:Product added!');

            // Clear the form and update the dropdowns
            setAddForm({ name: '', description: '' });
            await refreshMenu();
        } catch (err) {
            setAddMsg('error:Failed to add product.');
        } finally {
            setIsAdding(false);
        }
    };

    // Edit an existing product, only send fields that were actually filled in
    const handleEditProduct = async (e) => {
        e.preventDefault();

        if (!editProductForm.productId) {
            setEditProductMsg('error:Please select a product.');
            return;
        }

        setIsEditingProduct(true);
        setEditProductMsg('');

        try {
            // Only include fields that the user actually typed something into
            const fields = {};
            if (editProductForm.name.trim()) fields.name = editProductForm.name.trim();
            if (editProductForm.description.trim()) fields.description = editProductForm.description.trim();

            if (Object.keys(fields).length === 0) {
                setEditProductMsg('error:Please fill in at least one field to update.');
                setIsEditingProduct(false);
                return;
            }

            await productApi.updateProduct(restaurantId, editProductForm.productId, fields);
            setEditProductMsg('success:Product updated!');

            // Clear the form and update the dropdowns
            setEditProductForm({ productId: '', name: '', description: '' });
            await refreshMenu();
        } catch (err) {
            setEditProductMsg('error:Failed to update product.');
        } finally {
            setIsEditingProduct(false);
        }
    };

    // Remove a product from this restaurant
    const handleRemoveProduct = async (e) => {
        e.preventDefault();

        if (!removeProductId) {
            setRemoveProductMsg('error:Please select a product.');
            return;
        }

        setIsRemoving(true);
        setRemoveProductMsg('');

        try {
            await productApi.deleteProduct(restaurantId, removeProductId);
            setRemoveProductMsg('success:Product removed!');

            // Clear the selection and update the dropdowns
            setRemoveProductId('');
            await refreshMenu();
        } catch (err) {
            setRemoveProductMsg('error:Failed to remove product.');
        } finally {
            setIsRemoving(false);
        }
    };

    // Update the restaurant's details (currently just the name)
    const handleEditRestaurant = async (e) => {
        e.preventDefault();

        if (!editRestaurantForm.name.trim()) {
            setEditRestaurantMsg('error:Restaurant name cannot be empty.');
            return;
        }

        setIsEditingRestaurant(true);
        setEditRestaurantMsg('');

        try {
            await restaurantApi.updateRestaurant(restaurantId, { name: editRestaurantForm.name.trim() });
            setEditRestaurantMsg('success:Restaurant updated!');

            // Update the local state so the page title reflects the new name
            setRestaurant(prev => ({ ...prev, name: editRestaurantForm.name.trim() }));
        } catch (err) {
            setEditRestaurantMsg('error:Failed to update restaurant.');
        } finally {
            setIsEditingRestaurant(false);
        }
    };

    // Delete the restaurant entirely and redirect to the home page
    const handleCloseRestaurant = async () => {
        setIsClosing(true);
        setCloseMsg('');

        try {
            await restaurantApi.deleteRestaurant(restaurantId);

            // Restaurant is gone so navigate away
            navigate('/restaurant');
        } catch (err) {
            setCloseMsg('error:Failed to close restaurant.');
            setIsClosing(false);
        }
    };

    // Renders a success or error message depending on the prefix of the msg string
    const Feedback = ({ msg }) => {
        if (!msg) return null;
        const [type, text] = msg.split(':');
        return <p className={type === 'success' ? 'manage-success' : 'manage-error'}>{text}</p>;
    };

    // Handle loading and error states before rendering the page
    if (pageError) {
        return <div className="manage-container"><p className="manage-error">{pageError}</p></div>;
    }

    if (!restaurant) {
        return <div className="manage-container"><p>Loading restaurant...</p></div>;
    }

    return (
        <div className="manage-container">
            <h1>Manage: {restaurant.name}</h1>
            <p className="manage-subtitle">Restaurant ID: {restaurantId}</p>

            {/* Add a new product to the menu */}
            <div className="manage-section">
                <h2>Add Product</h2>
                <form onSubmit={handleAddProduct}>
                    <input
                        type="text"
                        placeholder="Product name"
                        value={addForm.name}
                        onChange={e => setAddForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <input
                        type="text"
                        placeholder="Description (optional)"
                        value={addForm.description}
                        onChange={e => setAddForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <button type="submit" className="manage-btn manage-btn-primary" disabled={isAdding}>
                        {isAdding ? 'Adding...' : 'Add Product'}
                    </button>
                    <Feedback msg={addMsg} />
                </form>
            </div>

            {/* Edit an existing product, select it from the dropdown */}
            <div className="manage-section">
                <h2>Edit Product</h2>
                <form onSubmit={handleEditProduct}>
                    {/* The last 4 chars of the UUID are shown to tell apart products with the same name */}
                    <select
                        value={editProductForm.productId}
                        onChange={e => setEditProductForm(f => ({ ...f, productId: e.target.value }))}
                    >
                        <option value="">-- Select a product --</option>
                        {menu.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (#{p.id.slice(-4)})</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        placeholder="New name (leave blank to keep)"
                        value={editProductForm.name}
                        onChange={e => setEditProductForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <input
                        type="text"
                        placeholder="New description (leave blank to keep)"
                        value={editProductForm.description}
                        onChange={e => setEditProductForm(f => ({ ...f, description: e.target.value }))}
                    />
                    <button type="submit" className="manage-btn manage-btn-primary" disabled={isEditingProduct}>
                        {isEditingProduct ? 'Saving...' : 'Edit Product'}
                    </button>
                    <Feedback msg={editProductMsg} />
                </form>
            </div>

            {/* Remove a product from the menu */}
            <div className="manage-section">
                <h2>Remove Product</h2>
                <form onSubmit={handleRemoveProduct}>
                    {/* Same UUID suffix trick as above */}
                    <select
                        value={removeProductId}
                        onChange={e => setRemoveProductId(e.target.value)}
                    >
                        <option value="">-- Select a product to remove --</option>
                        {menu.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (#{p.id.slice(-4)})</option>
                        ))}
                    </select>
                    <button type="submit" className="manage-btn manage-btn-danger" disabled={isRemoving}>
                        {isRemoving ? 'Removing...' : 'Remove Product'}
                    </button>
                    <Feedback msg={removeProductMsg} />
                </form>
            </div>

            {/* Update the restaurant's details */}
            <div className="manage-section">
                <h2>Edit Restaurant</h2>
                <form onSubmit={handleEditRestaurant}>
                    <input
                        type="text"
                        placeholder="Restaurant name"
                        value={editRestaurantForm.name}
                        onChange={e => setEditRestaurantForm(f => ({ ...f, name: e.target.value }))}
                    />
                    <button type="submit" className="manage-btn manage-btn-primary" disabled={isEditingRestaurant}>
                        {isEditingRestaurant ? 'Saving...' : 'Edit Restaurant'}
                    </button>
                    <Feedback msg={editRestaurantMsg} />
                </form>
            </div>

            {/* Permanently delete this restaurant - no going back */}
            <div className="manage-section danger-section">
                <h2>Close Restaurant</h2>
                <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '12px' }}>
                    This will permanently delete the restaurant and all its products.
                </p>
                <button className="manage-btn manage-btn-danger" onClick={handleCloseRestaurant} disabled={isClosing}>
                    {isClosing ? 'Closing...' : 'Close Restaurant'}
                </button>
                <Feedback msg={closeMsg} />
            </div>
        </div>
    );
}
