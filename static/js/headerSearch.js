(function() {
    $(".login-button").on('click', (e) => {
        e.preventDefault();
        $(location).attr('href', '/users/login');
    });

    $(".logout-button").on('click', (e) => {
        e.preventDefault();
        $(location).attr("href", "/users/logout");
    });

    $(".add-shoe-button").on('click', (e) => {
        e.preventDefault();
        $(location).attr("href", '/shoes/add');
    });

    $('.user-button').on('click', (e) => {
        e.preventDefault();
        $(location).attr("href", $('.user-button').attr('href'));
    });

    $('.settings-button').on('click', (e) => {
        e.preventDefault();
        $(location).attr('href', $('.settings-button').attr('href'));
    });

}())