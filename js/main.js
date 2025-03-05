// 产品数据
const products = [
    {
        name: "班级积分管理系统",
        description: "一个简单易用的班级积分管理工具，帮助教师轻松管理学生积分",
        image: "assets/images/class-points-system.png",
        link: "./product/ClassPointsSystem/index.html"
    }
];

// 页面加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 初始化产品展示
    initializeProducts();
    
    // 添加导航栏滚动效果
    window.addEventListener('scroll', function() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
        } else {
            navbar.style.backgroundColor = '#fff';
        }
    });

    // 添加平滑滚动效果
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// 初始化产品展示
function initializeProducts() {
    const productsGrid = document.querySelector('.products-grid');
    
    products.forEach(product => {
        const productCard = document.createElement('a');
        productCard.className = 'product-card';
        productCard.href = product.link;
        productCard.target = '_blank';
        
        productCard.innerHTML = `
            <div class="product-content">
                <img src="${product.image}" alt="${product.name}" class="product-image">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
            </div>
        `;
        
        productsGrid.appendChild(productCard);
    });
}

// 添加产品卡片的样式
const style = document.createElement('style');
style.textContent = `
    .product-card {
        background: white;
        border-radius: 10px;
        padding: 20px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        transition: all 0.3s;
        text-decoration: none;
        display: block;
        cursor: pointer;
    }

    .product-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    }

    .product-content {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    .product-image {
        width: 100%;
        height: auto;
        border-radius: 8px;
        margin-bottom: 15px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }

    .product-content h3 {
        color: #2c3e50;
        margin-bottom: 10px;
        text-align: center;
    }

    .product-content p {
        color: #666;
        margin-bottom: 15px;
        text-align: center;
    }
`;
document.head.appendChild(style); 