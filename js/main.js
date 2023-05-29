

// scroll suave
{
    // Seleccione todos los enlaces de anclaje en la página
    $('a[href*="#"]')
        // Agregue un evento de clic para interceptar el clic del enlace de anclaje
        .click(function (event) {
            // Prevenir el comportamiento predeterminado del navegador
            event.preventDefault();

            // Obtener el identificador del elemento de destino del enlace de anclaje
            var target = $(this.hash);

            // Desplazarse suavemente al elemento de destino utilizando jQuery ScrollTo
            $('html, body').animate({
                scrollTop: target.offset().top
            }, 1500);
        });
}

async function getProducts() {
    try {
        const data = await fetch("https://ecommercebackend.fundamentos-29.repl.co/");
        const res = await data.json();
        window.localStorage.setItem("products", JSON.stringify(res));
        return res;
    } catch (error) {
        console.log("Existe un problema de conexión con la API");
        throw error; // Lanzar el error para que se pueda manejar en la función main()
    }
}

async function main() {
    try {
        const productsFromLocalStorage = window.localStorage.getItem("products");
        let products;

        if (productsFromLocalStorage) {
            products = JSON.parse(productsFromLocalStorage);
        } else {
            products = await getProducts();
        }

        const bd = {
            products,
            cart: JSON.parse(window.localStorage.getItem("cart")) || {},
        };

        paintProducts(bd);
        addProductLocalStorage(bd);
        modal(bd);
        insertProductCart(bd);
        handleCartOption(bd);
        handleCartbuy(bd);
        mixfilter(bd)
    } catch (error) {
        console.log("Error al cargar los productos:", error);
    }
}

main();


function paintProducts(bd) {

    const productsHTML = document.querySelector('.productsDOM')


    html = '';

    for (const element of bd.products) {
        html += `
            <div class='cardProduct'>                
                <div class='cont_img_modal'><img class='image' src='${element.image}'/></div>
                <div class= 'description_element'>                
                    <p class='name' data-id='${element.id}' data-description="${element.description}" data-image="${element.image}" data-price="${element.price}" data-quantity="${element.quantity}" data-name="${element.name}" data-id="${element.id}">${element.name}</p>                    
                    
                    <div class='manejo_description'>
                        ${element.quantity ? `<div class='plusCard'><i class='bx bx-plus plus_card' id=${element.id} ></i></div>` : "<div class='sold_out'>Sold out</div>"}
                        
                        <p class='price'>$${element.price}</p
                        <p class='quantity'>Unit: ${element.quantity}</p>
                    </div>

                </div>
            </div>
        `
    }

    productsHTML.innerHTML = html
}

function modal(bd) {
    const descriptionElements = document.querySelectorAll('.description_element');

    descriptionElements.forEach((element) => {
        element.addEventListener('click', (e) => {

            if (e.target.classList.contains('name')) {
                // agregamos variables  y accedemos a la informacion contenida en el modal, el cual le dimos un atributo
                // a cada uno y le asignamos su respectivo valor.
                const id = e.target.getAttribute("data-id");
                const img = e.target.getAttribute("data-image");
                const name = e.target.getAttribute("data-name");
                const description = e.target.getAttribute("data-description");
                const price = e.target.getAttribute("data-price");
                const quantity = e.target.getAttribute("data-quantity");

                let html = '';

                html += `
                    <div class='window_modal'>
                        <div id='${id}'></div>
                        <img class='img_modal' src='${img}'></img>
                        <p class='name_modal'>${name}</p>
                        <p class='description_modal'>${description}</p>

                    <div class='precio_cantidad_modal'>
                        <div class='add_modal'>
                        <p class='price_modal'>$ ${price}</p>
                        <div class='plus_modal_cont plus_modal'>+</div>
                        </div>                        
                        <p class='quantity_modal'>Units: ${quantity}<p>
                    </div>
                    `

                Swal.fire({
                    html: html,
                    showCloseButton: false,
                    showConfirmButton: false,
                    scrollbarPadding: false,
                })


                // buscamos el elemento para el evento click
                const plusModalHTML = document.querySelector('.plus_modal')

                //recuperamos el valor del id del producto presentado en el modal
                const idHTML = Number(id);

                // agregamos el evento click
                plusModalHTML.addEventListener('click', () => {

                    //condicionamos cantidades en stock y lo que lleva en el carro                    
                    let searchProduct = bd.products.find((element) => element.id === idHTML)

                    // preguntamos si el cart esta vacio
                    if (Object.keys(bd.cart).length === 0) {
                        // si esta vacio le asignamos a cart una propiedad llamada amount y 1 
                        bd.cart[searchProduct.id] = { ...searchProduct, amount: 1 }
                        window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                        Swal.fire({
                            title: 'Producto agregado al carrito',
                            icon: 'success',
                            timerProgressBar: true,
                            scrollbarPadding: false,
                        });

                    } else {
                        // si esq exixte por lo menos un producto en el cart
                        if (Object.keys(bd.cart).length > 0) {
                            // preguntamos si el id del producto q estamos agregando esta en el cart
                            if (idHTML in bd.cart) {
                                // si esta preguntamos si la cantidad en bodega y la cantidad es igual para decir no disponible
                                if (searchProduct.quantity === bd.cart[idHTML].amount) {
                                    Swal.fire({
                                        title: 'Lo siento no disponemos de mas productos en stock',
                                        icon: 'error',
                                        timerProgressBar: true,
                                        scrollbarPadding: false,
                                    });
                                } else {
                                    // pues si no es igual sumamos 1 al amount
                                    bd.cart[idHTML].amount++;
                                    window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                                    Swal.fire({
                                        title: 'Producto agregado al carrito',
                                        icon: 'success',
                                        timer: 2000,
                                        scrollbarPadding: false,
                                    });

                                }
                            } else {
                                // encaso de que el producto no exita porq preguntamos si su id existia, pues no existio, pues agregamos el producto
                                bd.cart[searchProduct.id] = { ...searchProduct, amount: 1 }
                                window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                                Swal.fire({
                                    title: 'Producto agregado al carrito',
                                    icon: 'success',
                                    timerProgressBar: true,
                                    scrollbarPadding: false,
                                });

                            }
                        }
                    }
                    insertProductCart(bd);
                })

            }

        })
    });

}

function addProductLocalStorage(bd) {
    const productsDOMHTML = document.querySelector('.productsDOM')
    //buscando un elemento al dar click

    productsDOMHTML.addEventListener('click', function (e) {

        if (e.target.classList.contains('plus_card')) {
            const idProduct = Number(e.target.id);
            //busqueda del elemento en db asignandolo a una variable
            const productFind = bd.products.find((element) => element.id === idProduct);

            //si encontramos un id en cart como el del producto que hemos encontrado
            if (bd.cart[productFind.id]) {
                if (productFind.quantity === bd.cart[productFind.id].amount) {
                    Swal.fire({
                        title: `Lo siento, solo disponemos dede ${productFind.quantity} unidades.`,
                        icon: "error",
                        confirmButtonText: "Aceptar",
                        scrollbarPadding: false,
                    });
                } else {
                    Swal.fire({
                        icon: "success",
                        text: "Producto agregado al carrito",
                        timer: 1000,
                        timerProgressBar: true,
                        scrollbarPadding: false,

                    });
                    bd.cart[productFind.id].amount++;
                    window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                    insertProductCart(bd);


                }
            } else {
                Swal.fire({
                    icon: "success",
                    text: "Producto agregado al carrito",
                    timer: 1000,
                    timerProgressBar: true,
                    scrollbarPadding: false,

                });
                bd.cart[productFind.id] = { ...productFind, amount: 1 }
                window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                insertProductCart(bd);


            }
        }


    })
}

function handleCartShow() {
    const bxCartHTML = document.querySelector('.bx-cart-alt');
    const cartHTML = document.querySelector('.cart');
    bxCartHTML.addEventListener('click', () => {
        cartHTML.classList.add('cartShow')
    })
}
handleCartShow();

function handleCartHidden() {
    const bxHTML = document.querySelector('.bx-x');
    const cartHTML = document.querySelector('.cart');
    bxHTML.addEventListener('click', () => {
        cartHTML.classList.remove('cartShow')
    })
}
handleCartHidden();

function hiddenCartAuto(){    
    const cartHTML = document.querySelector('.cart');
    cartHTML.classList.remove('cartShow')
}

function insertProductCart(bd) {

    const cartHTML = document.querySelector('.cart_content');
    let html = "";

    for (const product in bd.cart) {
        const { quantity, price, name, image, id, amount } = bd.cart[product];
        html += `
            <div class= "contenedor_cart_product">
                <div class = "card_product">
                    <div class = "card_product_img">
                        <img class = "img_cart"src="${image}" alt="image" />
                    </div>

                    <div class = "card_product_body">
                        <p class="name_product_cart">${name}</p>
                        <p class = "stock_cart"> Stock: ${quantity} | <span class="precio_cart">$${price}</span></p>
                        <p class="subtotal_cart">Subtotal: ${"$" + price * amount}</p>

                        <div class = "card_product_body_op" id="${id}">
                            <i class='bx bx-minus minus_cart' id="${id}"></i>
                            <span class = "units_car">${amount} unit </span>
                            <i class='bx bx-plus plus_cart' id="${id}"></i>                        
                            <i class='bx bxs-trash trash_cart' id="${id}"></i>
                        </div>
                    </div>
                </div>
                
            </div>
        `;
    }
    cartHTML.innerHTML = html;
    window.localStorage.setItem("cart", JSON.stringify(bd.cart));
    handleCartbuy(bd);

}

function handleCartOption(bd) {
    const cartContentHTML = document.querySelector('.cart_content');

    cartContentHTML.addEventListener('click', function (e) {

        if (e.target.classList.contains('plus_cart')) {
            const id = Number(e.target.parentElement.id);
            const quantityProducts = Number(bd.products[id - 1].quantity)
            const amountProducts = Number(bd.cart[id].amount)

            if (quantityProducts <= amountProducts) {
                Swal.fire({
                    title: `Lo siento, solo disponemos dede ${quantityProducts} unidades.`,
                    icon: "error",
                    confirmButtonText: "Aceptar",
                    scrollbarPadding: false,
                });

            } else {
                bd.cart[id].amount++;
                window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                insertProductCart(bd);
                handleCartbuy(bd);


            }

        }

        if (e.target.classList.contains('minus_cart')) {
            const id = Number(e.target.parentElement.id);
            if (bd.cart[id].amount === 1) {
                Swal.fire({
                    title: 'Estas seguro de eliminar este producto',
                    icon: "info",
                    confirmButtonText: "Aceptar",
                    cancelButtonText: "Cancelar",
                    scrollbarPadding: false,
                }).then((result) => {
                    if (result.isConfirmed) {
                        delete bd.cart[id];
                        window.localStorage.setItem('cart', JSON.stringify(bd.cart));
                        insertProductCart(bd);
                        handleCartbuy(bd);

                    }
                })
            } else {
                bd.cart[id].amount--;
                window.localStorage.setItem('cart', JSON.stringify(bd.cart));
                insertProductCart(bd);
                handleCartbuy(bd);


            }
        }

        if (e.target.classList.contains('trash_cart')) {
            const id = Number(e.target.parentElement.id);
            Swal.fire({
                title: 'Estas seguro de eliminar este producto',
                icon: "info",
                confirmButtonText: "Aceptar",
                cancelButtonText: "Cancelar",
                scrollbarPadding: false,
            }).then((result) => {
                if (result.isConfirmed) {
                    delete bd.cart[id];
                    window.localStorage.setItem('cart', JSON.stringify(bd.cart));
                    insertProductCart(bd);
                    handleCartbuy(bd);

                }
            })
        }
    })
}

function handleCartbuy(bd) {

    const handleCartBuyHTML = document.querySelector('.handleBuy');
    let statusbuy = false;
    let total = 0;
    let amountSummary = 0
    //sumando precio y cantidad en el cart
    for (element in bd.cart) {
        if (element) {
            amountSummary += bd.cart[element].amount;
            amountProduct = bd.cart[element].amount;
            price = bd.cart[element].price
            total += amountProduct * price
        }
    }

    let html = '';

    html += `
    <div class="infoBuy">
        <p class="quantity_cart">Unit: ${amountSummary}</p>
        <p class="price_cart">$${total}.00</p>
    </div>
        <button class="btn_buy">Comprar</button>
    `
    handleCartBuyHTML.innerHTML = html;


    const btnBuy = document.querySelector('.btn_buy')
    
    btnBuy.addEventListener('click', (e) => {
        hiddenCartAuto()
        // si el carro esta vacio
        if (!Object.values(bd.cart).length) {
            Swal.fire({
                title: "¡El carrito está vacío!",
                icon: "error",
                confirmButtonText: "Aceptar",
                scrollbarPadding: false,
            });
        }else{
            Swal.fire({
                title: "Gracias por tu compra",
                icon: "success",                
                scrollbarPadding: false,
            });
        }

        const currentProducts = [];
        
        // itero en cada elemento de cada elmento que exista en cart
        for (elementCart in bd.cart) {
            
            if (bd.cart.hasOwnProperty(elementCart)) {
                // asigno a una variable bd.cart para poder consultar
                const value = bd.cart[elementCart];
                // itero sobre cada producto en bd.product
                for (product of bd.products) {
                    //pregunto si el producto tiene el id del producto del cart
                    if (value.id === product.id) {
                        //si lo tiene entonces desestructuramos
                        currentProducts.push({
                            ...product,
                            quantity: product.quantity - value.amount,
                        });
                        statusbuy = true
                    } else {
                        //si no tiene el id se pushea al arreglo currentpush
                        currentProducts.push(product)
                        statusbuy = true
                    }

                    //actualizamos valores
                    bd.products = currentProducts;
                    bd.cart = {}

                    //actualizamos valores en localStorage
                    window.localStorage.setItem('products', JSON.stringify(bd.products));
                    window.localStorage.setItem('cart', JSON.stringify(bd.cart));
                    //llamamos funciones necesarias
                    insertProductCart(bd);
                    paintProducts(bd);
                    modal(bd);
                }
            }
              
        }

        insertProductCart(bd);
        paintProducts(bd);
        modal(bd);
        


    })

    
}

function mixfilter(bd) {
    const buttonAll = document.getElementById('all');
    const buttonShirt = document.getElementById('shirt');
    const buttonHoddies = document.getElementById('hoddies');
    const buttonSweater = document.getElementById('sweater');
    const productsDOM = document.querySelector('.productsDOM');

    buttonShirt.addEventListener('click', () => {
        const category = bd.products.filter(product => product.category === 'shirt');

        let html = '';

        category.forEach(element => {
            html += `
            <div class='cardProduct hidden'>                
                <div class='cont_img_modal'><img class='image' src='${element.image}'/></div>
                <div class= 'description_element'>                
                    <p class='name' data-id='${element.id}' data-description="${element.description}" data-image="${element.image}" data-price="${element.price}" data-quantity="${element.quantity}" data-name="${element.name}" data-id="${element.id}">${element.name}</p>                    
                    <div class='manejo_description'>
                        ${element.quantity ? `<div class='plusCard'><i class='bx bx-plus plus_card' id=${element.id} ></i></div>` : "<div class='sold_out'>Sold out</div>"}
                        <p class='price'>$${element.price}</p>
                        <p class='quantity'>Unit: ${element.quantity}</p>
                    </div>
                </div>
            </div>
            `;
        });

        productsDOM.innerHTML = html;

    });


    buttonAll.addEventListener('click', () => {
        const category = bd.products

        let html = '';

        category.forEach(element => {
            html += `
            <div class='cardProduct'>                
                <div class='cont_img_modal'><img class='image' src='${element.image}'/></div>
                <div class= 'description_element'>                
                    <p class='name' data-id='${element.id}' data-description="${element.description}" data-image="${element.image}" data-price="${element.price}" data-quantity="${element.quantity}" data-name="${element.name}" data-id="${element.id}">${element.name}</p>                    
                    <div class='manejo_description'>
                        ${element.quantity ? `<div class='plusCard'><i class='bx bx-plus plus_card' id=${element.id} ></i></div>` : "<div class='sold_out'>Sold out</div>"}
                        <p class='price'>$${element.price}</p>
                        <p class='quantity'>Unit: ${element.quantity}</p>
                    </div>
                </div>
            </div>
            `;
        });

        productsDOM.innerHTML = html;

    });

    
    buttonHoddies.addEventListener('click', () => {
        const category = bd.products.filter(product => product.category == 'hoddie')

        let html = '';

        category.forEach(element => {
            html += `
            <div class='cardProduct'>                
                <div class='cont_img_modal'><img class='image' src='${element.image}'/></div>
                <div class= 'description_element'>                
                    <p class='name' data-id='${element.id}' data-description="${element.description}" data-image="${element.image}" data-price="${element.price}" data-quantity="${element.quantity}" data-name="${element.name}" data-id="${element.id}">${element.name}</p>                    
                    <div class='manejo_description'>
                        ${element.quantity ? `<div class='plusCard'><i class='bx bx-plus plus_card' id=${element.id} ></i></div>` : "<div class='sold_out'>Sold out</div>"}
                        <p class='price'>$${element.price}</p>
                        <p class='quantity'>Unit: ${element.quantity}</p>
                    </div>
                </div>
            </div>
            `;
        });

        productsDOM.innerHTML = html;
    });

    
    buttonSweater.addEventListener('click', () => {
        const category = bd.products.filter(product => product.category == 'sweater')

        let html = '';

        category.forEach(element => {
            html += `
            <div class='cardProduct'>                
                <div class='cont_img_modal'><img class='image' src='${element.image}'/></div>
                <div class= 'description_element'>                
                    <p class='name' data-id='${element.id}' data-description="${element.description}" data-image="${element.image}" data-price="${element.price}" data-quantity="${element.quantity}" data-name="${element.name}" data-id="${element.id}">${element.name}</p>                    
                    <div class='manejo_description'>
                        ${element.quantity ? `<div class='plusCard'><i class='bx bx-plus plus_card' id=${element.id} ></i></div>` : "<div class='sold_out'>Sold out</div>"}
                        <p class='price'>$${element.price}</p>
                        <p class='quantity'>Unit: ${element.quantity}</p>
                    </div>
                </div>
            </div>
            `;
        });

        productsDOM.innerHTML = html;
    });
}

