refreshCart();

function refreshCart(){
    // load dropdown cart
    loadCart();

    // if it is in cart_detail, then load cart detail
    if (checkCurrentURL('/cart_detail/')){
        loadCartDetail();
    }

    // request get method to determine whether clean the cart
    $.ajax({
        type: "GET",
        url: '/clear_localstorage',
        dataType: "json",
        success: function (response) {
            console.log(response.clear_localstorage);
            if(response.clear_localstorage){
                // clean the cart and refresh
                localStorage.removeItem("cart");
                loadCart();
            }
        },
        error: function (thrownError) {
          console.log(thrownError);
        }
      });
}

function getCart(){
    // load cart data from localStorage
    var cart = localStorage.getItem("cart");
    // check whether the cart is empty or not, then decide whether create a new one
    if (cart !== null) {
        // parse cart data into JSON format
        cart = JSON.parse(cart);
    } else {
        cart = {};
    }
    return cart;
}

function setCart(cart){
    localStorage.setItem("cart", JSON.stringify(cart));
}

function isEmptyCart(cart){
    return Object.keys(cart).length === 0;
}

function getCartItem(cart, pk){
    return cart[pk];
}

function setCartItem(cart, pk, cartItem){
    cart[pk] = cartItem;
}

function updateQuantity(cartItem, value){
    cartItem['quantity'] = value;
}

function getSortedKeys(cart){
    // alphabetical sort primary keys
    var pks = Object.keys(cart).map(pk =>[pk, cart[pk]['title']]).sort((title1,title2) => title1[1].localeCompare(title2[1]));
    pks = pks.map(pk => Number(pk[0]));
    return pks;
}

function redirect(url){
    location.assign(url);
}

function checkCurrentURL(url){
    return window.location.pathname === url;
}

function loadCart(){
    // get cart from localStorage and parse it
    var cart = getCart();

    // fetch dropdown cart element
    var dropDown = $('#cart');

    // clear all the element at the beginning
    dropDown.html('');
    
    // check whether the cart is empty or not
    if (isEmptyCart(cart)){
        // if cart is empty, show message and then clear cart element in localStorage
        dropDown.append("<li><span>Your cart is empty!</span></li>");
        localStorage.removeItem("cart");
    } else {
        // get sorted keys
        var pks = getSortedKeys(cart);

        // generate each cartItem and buttons in dropdown cart
        for (var i=0; i<pks.length; i++){
            var pk = pks[i];
            var productDetails = cart[pk];
            dropDown.append(`
            <li>
                <span class='dropdown-content'>
                    <h1>${productDetails['title']}</h1>
                    <p>${productDetails['quantity']}</p>
                    <button type="button" class="btn btn-primary" value="${pk}" onclick="append(this.value)">+</button>
                    <button type="button" class="btn btn-danger" value="${pk}" onclick="remove(this.value)">-</button>
                    <hr class="dropdown-divider">
                </span>
            </li>
            `);
        }

        dropDown.append(`
        <li>
            <span class='dropdown-content'>
                <button type="button" class="btn btn-primary" onclick="redirect('/cart_detail')">View Cart</button>
            </span>
        </li>
        `);
    }    
}

function loadCartDetail(){
    // get cart from localStorage and parse it
    var cart = getCart();

    // fetch cart_detail element
    var detail = $("#cart_detail");
    
    // clear all the element at the beginning
    detail.html('');
    
    // check whether the cart is empty or not
    if (isEmptyCart(cart)){
        // if cart is empty, show message and then clear cart element in localStorage
        detail.append("<h1>Your cart is empty!</h1>");
    } else {
        // get sorted keys
        var pks = getSortedKeys(cart);

        // generate each cartItem and buttons in cart_detail
        for (var i=0; i<pks.length; i++){
            var pk = pks[i];
            var productDetails = cart[pk];
            detail.append(`
            <label>${productDetails['title']}</label>
            <input type="number" name="${pk}" value="${productDetails['quantity']}" min="1" step="1" onchange="updateCartItem(this.name, this.value)"></input>
            <button type="button" class="btn btn-primary" value="${pk}" onclick="append(this.value)">+</button>
            <button type="button" class="btn btn-danger" value="${pk}" onclick="remove(this.value)">-</button>
            <button type="button" class="btn btn-danger" value="${pk}" onclick="clearCartItem(this.value)">clear</button>
            <hr>
            `);
        }

        detail.append(`
        <input type="submit" class="btn btn-primary" value="Checkout">
        `)
    }
}

function addToCart(){
    // get product information
    var pk = $("#product_pk").attr('value');
    var title = $("#product_title").attr('value');
    var image = $("#product_image").attr('src');
    var price = $("#product_price").attr('value');
    var quantity = $("#product_quantity").prop('value');
    
    // get cart from localStorage and parse it
    var cart = getCart();

    // check whether the product is in the cart or not, then decide whether create a new one or update it
    var cartItem = getCartItem(cart, pk);
    if (cartItem === undefined){
        cartItem = {'title': title, 'image': image, 'price': price, 'quantity': Number(quantity)};
    } else {
        updateQuantity(cartItem, Number(cartItem['quantity']) + Number(quantity));
    }

    // update cartItem
    setCartItem(cart, pk, cartItem);

    // update cart on localStorage
    setCart(cart);

    // refresh the related html elements
    refreshCart();
}

function append(pk){
    // get cart from localStorage and parse it
    var cart = getCart();

    // get cartItem from cart and increase it
    var cartItem = getCartItem(cart, pk);
    updateQuantity(cartItem, Number(cartItem['quantity']) + 1);

    // update cartItem
    setCartItem(cart, pk, cartItem);

    // update cart on localStorage
    setCart(cart);

    // refresh the related html elements
    refreshCart();
}

function remove(pk){
    // get cart from localStorage and parse it
    var cart = getCart();

    // get cartItem from cart and decrease it
    var cartItem = getCartItem(cart, pk);
    updateQuantity(cartItem, Number(cartItem['quantity']) - 1);

    // determine whether the quantity is below 0, then decide to update cartItem or delete it
    if (cartItem['quantity'] > 0){
        setCartItem(cart, pk, cartItem);
    } else {
        delete cart[pk];
    }
    
    // update cart on localStorage
    setCart(cart);

    // refresh the related html elements
    refreshCart();
}

// the following functions only exist in cart_detail page

function updateCartItem(pk, quantity){
    // the quantity cannot below 1
    if (quantity < 1) {
        quantity = 1;
    }

    // get cart from localStorage and parse it
    var cart = getCart();

    // get item from cart and update it
    var cartItem = getCartItem(cart, pk);
    updateQuantity(cartItem, Number(quantity));

    // update cartItem
    setCartItem(cart, pk, cartItem);

    // update cart on localStorage
    setCart(cart);

    // refresh the related html elements
    refreshCart();
}

function clearCartItem(pk){
    // get cart from localStorage and parse it
    var cart = getCart();
    
    // delete this cartItem from cart
    delete cart[pk];
    
    // update cart on localStorage
    setCart(cart);

    // refresh the related html elements
    refreshCart();
}