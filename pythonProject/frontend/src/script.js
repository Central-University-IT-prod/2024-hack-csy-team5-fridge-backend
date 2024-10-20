let available_products = {}; // Инициализация переменной для доступных продуктов

document.addEventListener('DOMContentLoaded', async () => {
    await loadAvailableProducts();
    loadProducts(); // Загружаем продукты при загрузке страницы

    // Запрет выбора будущих дат
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('purchase-date').setAttribute('max', today);

    // Проверка, есть ли данные о пользователе в localStorage
    const userEmail = localStorage.getItem('userEmail');
    if (userEmail) {
        document.getElementById('user-email').textContent = userEmail;
        document.getElementById('profile-section').style.display = 'block'; // Открываем личный кабинет
        document.getElementById('login-button').style.display = 'none'; // Скрываем кнопку входа/регистрации
    }

    // Открытие модального окна
    document.getElementById('login-button').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'block';
    });

    // Закрытие модального окна
    document.querySelector('.close').addEventListener('click', () => {
        document.getElementById('modal').style.display = 'none';
    });

    window.onclick = function(event) {
        if (event.target == document.getElementById('modal')) {
            document.getElementById('modal').style.display = 'none';
        }
    };

    // Обработка формы входа
    document.getElementById('auth-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        alert("Вход выполнен!");
        document.getElementById('modal').style.display = 'none';
        document.getElementById('user-email').textContent = email; // Отображаем email пользователя
        document.getElementById('profile-section').style.display = 'block'; // Открываем личный кабинет
        document.getElementById('login-button').style.display = 'none'; // Скрываем кнопку входа/регистрации

        // Сохраняем данные о пользователе в localStorage
        localStorage.setItem('userEmail', email);
    });

    // Обработка регистрации
    document.getElementById('register-button').addEventListener('click', async () => {
        alert("Регистрация выполнена!");
        document.getElementById('modal').style.display = 'none';
        const email = document.getElementById('email').value;
        document.getElementById('user-email').textContent = email; // Отображаем email пользователя
        document.getElementById('profile-section').style.display = 'block'; // Открываем личный кабинет
        document.getElementById('login-button').style.display = 'none'; // Скрываем кнопку входа/регистрации

        // Сохраняем данные о пользователе в localStorage
        localStorage.setItem('userEmail', email);
    });

    // Обработка выхода
    document.getElementById('logout-button').addEventListener('click', () => {
        document.getElementById('profile-section').style.display = 'none'; // Скрываем личный кабинет
        document.getElementById('login-button').style.display = 'block'; // Показываем кнопку входа/регистрации
        localStorage.removeItem('userEmail'); // Удаляем данные о пользователе из localStorage
    });

    // Обработка нажатия на иконку добавления продукта
    document.getElementById('add-product-icon').addEventListener('click', async () => {
        const name = document.getElementById('product-name').value;
        const purchaseDate = document.getElementById('purchase-date').value;

        // Проверка на пустую дату покупки
        if (!name || !purchaseDate) {
            alert("Продукт и дата покупки не могут быть пустыми.");
            return;
        }

        const expiryDate = available_products[name]; // Получаем срок годности для выбранного продукта

        const formData = new URLSearchParams();
        formData.append('name', name);
        formData.append('purchase_date', purchaseDate);
        formData.append('expiry_date', expiryDate);

        const response = await fetch('http://{{sensitive data}}:8000/api/products', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: formData,
        });

        if (response.ok) {
            const product = await response.json();
            console.log('Продукт добавлен:', product);
            await loadProducts(); // Обновляем список продуктов после добавления
            document.getElementById('product-name').value = ''; // Очищаем поле ввода
            document.getElementById('purchase-date').value = ''; // Очищаем дату покупки
        } else {
            console.error('Ошибка при добавлении продукта:', response.statusText);
        }
    });

    // Скрываем список продуктов при загрузке страницы
    const productList = document.getElementById('product-list');
    productList.style.display = 'none';

    // Обработка нажатия на кнопку "Показать продукты"
    document.getElementById('show-button').addEventListener('click', () => {
        if (productList.style.display === 'none' || productList.style.display === '') {
            loadProducts(); // Загружаем продукты, если список скрыт
            productList.style.display = 'block'; // Показываем список
        } else {
            productList.style.display = 'none'; // Скрываем список
        }
    });
});

async function loadAvailableProducts() {
    const response = await fetch('http://{{sensitive data}}:8000/api/available-products');
    if (response.ok) {
        const products = await response.json();
        const productSelect = document.getElementById('product-name');

        // Получаем сроки годности
        const expiryResponse = await fetch('http://{{sensitive data}}:8000/api/expiry-dates');
        available_products = await expiryResponse.json(); // Сохраняем сроки годности в переменной

        products.forEach(product => {
            const option = document.createElement('option');
            option.value = product;
            option.textContent = `${product} - ${available_products[product]}`; // Используем доступные сроки
            productSelect.appendChild(option);
        });
    } else {
        console.error('Ошибка при загрузке доступных продуктов:', response.statusText);
    }
}

async function loadProducts() {
    const response = await fetch('http://{{sensitive data}}:8000/api/products', {
        method: 'GET',
        headers: {
            'accept': 'application/json',
        },
    });

    if (response.ok) {
        const products = await response.json();
        displayProducts(products);
    } else {
        console.error('Ошибка при загрузке продуктов:', response.statusText);
    }
}

function displayProducts(products) {
    const productList = document.getElementById('product-list');
    productList.innerHTML = ''; // Очищаем предыдущий список

    if (products.length === 0) {
        const emptyMessage = document.createElement('div');
        emptyMessage.textContent = 'Список продуктов пуст.';
        emptyMessage.style.color = 'gray'; // Устанавливаем цвет для сообщения
        productList.appendChild(emptyMessage);
    } else {
        products.forEach(product => {
            const productItem = document.createElement('div');
            productItem.textContent = `${product.name} - Срок годности: ${product.expiry_date} - Дата покупки: ${product.purchase_date}`;
            if (product.is_expired) {
                productItem.style.color = 'red'; // Подсвечиваем истёкшие продукты
                productItem.textContent += " (Истек)";
            }

            // Добавляем изображение для удаления продукта
            const deleteIcon = document.createElement('img');
            deleteIcon.src = 'images/exit.png'; // Путь к вашей иконке
            deleteIcon.alt = 'Удалить';
            deleteIcon.style.cursor = 'pointer'; // Указатель на курсор
            deleteIcon.style.width = '20px'; // Размер иконки
            deleteIcon.style.height = '20px'; // Размер иконки
            deleteIcon.addEventListener('click', () => deleteProduct(product.id));

            productItem.appendChild(deleteIcon);
            productList.appendChild(productItem);
        });
    }
}

async function deleteProduct(productId) {
    const response = await fetch(`http://{{sensitive data}}:8000/api/products/${productId}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        loadProducts(); // Обновляем список после удаления
    } else {
        console.error('Ошибка при удалении продукта:', response.statusText);
    }
}
