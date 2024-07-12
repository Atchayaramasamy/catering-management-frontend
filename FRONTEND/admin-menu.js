document.addEventListener('DOMContentLoaded', () => {
    const foodList = document.getElementById('foodList');
    const addFoodForm = document.getElementById('addFoodForm');
    const logoutBtn = document.getElementById('logoutBtn');
    let selectedFoodId = null;

    // Function to fetch all food items from backend
    async function fetchFoodItems() {
        try {
            const response = await fetch('http://localhost:8081/api/menus/getAll');
            if (!response.ok) {
                throw new Error('Failed to fetch food items');
            }
            const foodItems = await response.json();
            displayFoodItems(foodItems);
        } catch (error) {
            console.error('Error fetching food items:', error);
        }
    }

    // Initial fetch of food items
    fetchFoodItems();

    // Function to display food items in table
    function displayFoodItems(foodItems) {
        const tableBody = foodList.querySelector('tbody');
        tableBody.innerHTML = '';
        foodItems.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${item.foodId}</td>
                <td>${item.foodName}</td>
                <td>${item.price.toFixed(2)}</td>
                <td>
                    <button onclick="editFood(${item.foodId})">Edit</button>
                    <button onclick="deleteFood(${item.foodId})">Delete</button>
                </td>
            `;
            tableBody.appendChild(row);
        });
    }

    // Add Food Form Submission
    addFoodForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const foodName = document.getElementById('foodName').value;
        const foodPrice = parseFloat(document.getElementById('foodPrice').value);

        const newFoodItem = { foodName, price: foodPrice };

        try {
            const response = await fetch('http://localhost:8081/api/menus', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(newFoodItem),
            });

            if (!response.ok) {
                throw new Error('Failed to add food item');
            }

            alert('Food item added successfully');
            fetchFoodItems(); // Refresh food items list
            addFoodForm.reset(); // Clear form fields
        } catch (error) {
            console.error('Error adding food item:', error);
            alert('Error adding food item. Please try again.');
        }
    });

    // Logout Button Click
    logoutBtn.addEventListener('click', () => {
        // Perform logout actions here (e.g., clear session, redirect to login page)
        window.location.href = 'login.html'; // Redirect to login page
    });

    // Function to delete food item
    window.deleteFood = async function deleteFood(foodId) {
        try {
            const response = await fetch(`http://localhost:8081/api/menus/${foodId}`, {
                method: 'DELETE'
            });
    
            if (!response.ok) {
                throw new Error('Failed to delete food item');
            }
    
            alert('Food item deleted successfully');
            fetchFoodItems(); // Refresh the food items list after successful deletion
        } catch (error) {
            console.error('Error deleting food item:', error);
            alert('Error deleting food item. Please try again.');
        }
    };
    

    // Function to populate form fields for editing
    window.editFood = function(id) {
        selectedFoodId = id;
        const foodNameField = document.getElementById('foodName');
        const foodPriceField = document.getElementById('foodPrice');

        // Fetch food item details by ID
        fetch(`http://localhost:8081/api/menus/${id}`)
            .then(response => response.json())
            .then(data => {
                foodNameField.value = data.foodName;
                foodPriceField.value = data.price;
            })
            .catch(error => {
                console.error('Error fetching food item:', error);
            });
    };

    // Update Food Form Submission
    addFoodForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const foodName = document.getElementById('foodName').value;
        const foodPrice = parseFloat(document.getElementById('foodPrice').value);

        const updatedFoodItem = { foodName, price: foodPrice };

        try {
            const response = await fetch(`http://localhost:8081/api/menus/${selectedFoodId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updatedFoodItem),
            });

            if (!response.ok) {
                throw new Error('Failed to update food item');
            }

            alert('Food item updated successfully');
            fetchFoodItems(); // Refresh food items list
            addFoodForm.reset(); // Clear form fields
            selectedFoodId = null; // Reset selected food ID
        } catch (error) {
            console.error('Error updating food item:', error);
            
        }
    });

});
