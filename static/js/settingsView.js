(function(){

    let replaceForm = $('.replaceForm');
    var action = $(replaceForm).attr('id');

    $('#changeUsername').on('click', (e) => {
        e.preventDefault();
        let newForm = 
        '<form action="'+action+'username" method="POST" class="form settings-form">' +
            '<input class="form-control mr-sm-2" type="text" placeholder="New Username" name="newUsername">' +
            '<button type="submit" class="btn btn-success">Submit</button>' +
        '</form>';

        replaceForm.html(newForm);
    });

    $('#changeAvatar').on('click', (e) => {
        e.preventDefault();
        let newForm = 
        '<form action="'+action+'avatar" method="POST" class="form settings-form" enctype="multipart/form-data">' +
            '<input name="image" type="file" accept="image/*">' +
            '<button type="submit" class="btn btn-success">Submit</button>' +
        '</form>';

        replaceForm.html(newForm);
    });

    $('#changePassword').on('click', (e) => {
        e.preventDefault();
        let newForm = 
        '<form action="'+action+'password" method="POST" class="form settings-form">' +
            '<input class="form-control mr-sm-2" type="password" placeholder="Old Password" name="oldPassword">' +
            '<input class="form-control mr-sm-2" type="password" placeholder="New Password" name="newPassword">' +
            '<input class="form-control mr-sm-2" type="password" placeholder="Confirm your password" name="newPasswordValidation">' +
            '<button type="submit" class="btn btn-success">Submit</button>' +
        '</form>';

        replaceForm.html(newForm);
    });

    $('#changeEmail').on('click', (e) => {
        e.preventDefault();
        let newForm = 
        '<form action="'+action+'email" method="POST" class="form settings-form">' +
            '<input class="form-control mr-sm-2" type="email" placeholder="New Email" name="newEmail">' +
            '<button type="submit" class="btn btn-success">Submit</button>' +
        '</form>';

        replaceForm.html(newForm);
    });
}())