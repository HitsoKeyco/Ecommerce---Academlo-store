
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
        //asignamos a variable la peticion a la API
        const data = await fetch(
            "https://ecommercebackend.fundamentos-29.repl.co/"
        );

        //conversion de string a un arreglo con sus objetos "elementos".
        const res = await data.json();

        // permite q se guarde datos en el localStorage -solo acepta string
        window.localStorage.setItem("products", JSON.stringify(res));

        //Devolvemos elarreglo
        return res;

    } catch (error) {
        //devuelve error por consola en caso de encontrarlo
        console.log("existe un problema de conexion con la API");
    }
}

async function main() {
    // llamamos a la funcion que  consulta a la API.
    getProducts();
    //declaramos una variable db que va a tener el contenido de la api y se crea el cart.
    const bd = {
        // conseguimos los productos y los parseamos osea es un string y lo convertimos en un objeto o esperamos. 
        products: JSON.parse(window.localStorage.getItem("products")) || (await getProducts()),
        // creamos cart y los parseamos osea es un string y lo convertimos en un onjeto o vacio.
        cart: JSON.parse(window.localStorage.getItem("cart")) || {},

    };
    paintProducts(bd);
    addProductLocalStorage(bd);
    modal(bd);
    insertProductCart(bd);

}
main()

function paintProducts(bd) {

    const productsHTML = document.querySelector('.productsDOM')


    html = '';

    for (const element of bd.products) {
        html += `
            <div class='cardProduct'>                
                <div class='cont_img_modal'><img class='image' src='${element.image}'/></div>
                <div class= 'description_element'>                
                    <p class='name' data-id='${element.id}' data-description="${element.description}" data-image="${element.image}" data-price="${element.price}" data-quantity="${element.quantity}" data-name="${element.name}" data-id="${element.id}">${element.name}</p>                    
                    <p class='description' ">${element.description}</p>
                    <div class='manejo_description' >                        
                        <div class='plusCard'><i class='bx bx-plus plus_card' id='${element.id}'></i></div>
                        <p class='price'>$${element.price}
                        <p class='quantity'>Unit: ${element.quantity}
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
                        });
                        
                    }else{
                        // si esq exixte por lo menos un producto en el cart
                    if (Object.keys(bd.cart).length > 0) {
                        // preguntamos si el id del producto q estamos agregando esta en el cart
                        if(idHTML in bd.cart){
                            // si esta preguntamos si la cantidad en bodega y la cantidad es igual para decir no disponible
                            if(searchProduct.quantity === bd.cart[idHTML].amount){                            
                                Swal.fire({
                                    title: 'Lo siento no disponemos de mas productos en stock',
                                    icon: 'error',
                                    timerProgressBar: true,
                                });
                            }else{	
                            // pues si no es igual sumamos 1 al amount
                            bd.cart[idHTML].amount++;
                            window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                            Swal.fire({
                                title: 'Producto agregado al carrito',
                                icon: 'success',
                                timer: 2000,
                            });
                                
                            }
                        }else{
                            // encaso de que el producto no exita porq preguntamos si su id existia, pues no existio, pues agregamos el producto
                            bd.cart[searchProduct.id] = { ...searchProduct, amount: 1 }
                            window.localStorage.setItem("cart", JSON.stringify(bd.cart));
                            Swal.fire({
                            title: 'Producto agregado al carrito',
                            icon: 'success',
                            timerProgressBar: true,
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

            }
        }

        insertProductCart(bd);
    })
}

function handleCartShow() {
    const bxCartHTML = document.querySelector('.bx-cart-alt');
    const cartHTML = document.querySelector('.cart');
    bxCartHTML.addEventListener('click', () => {
        cartHTML.classList.add('cartShow')
        console.log('Show')
    })
}
handleCartShow();

function handleCartHidden() {
    const bxHTML = document.querySelector('.bx-x');
    const cartHTML = document.querySelector('.cart');
    bxHTML.addEventListener('click', () => {
        cartHTML.classList.remove('cartShow')
        console.log('hidden')
    })
}
handleCartHidden();


function insertProductCart(bd) {

    const cartHTML = document.querySelector('.cart_content');
    let html = "";

    for (const product in bd.cart) {
        const { quantity, price, name, image, id, amount } = bd.cart[product];
        html += `
            <div class= "contenedor_cart_product">
                <div class = "card_product">
                    <div class = "card_product_img">
                        <img class = "img_cart"src="${image}" alt = "image" />
                    </div>

                    <div class = "card_product_body">
                        <p class="name_product_cart">${name}</p>
                        <p class = "stock_cart"> Stock: ${quantity} | <span class="precio_cart">$${price}</span></p>
                        <p class="subtotal_cart">Subtotal: ${"$" + price * amount}</p>

                        <div class = "card_product_body_op" id="${id}">
                            <i class='bx bx-minus'></i>
                            <span class = "units_car">${amount} unit </span>
                            <i class='bx bx-plus plus_cart'></i>                        
                            <i class='bx bxs-trash' ></i>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }    
    cartHTML.innerHTML = html;
    window.localStorage.setItem("cart", JSON.stringify(bd.cart));
}



