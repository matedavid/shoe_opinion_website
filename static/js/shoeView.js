(function() {
    $(document).ready(() => {
        // Star preload
        const starsP = $('.stars');
        const stars = Math.round(parseInt(starsP.attr('value')));

        let blankStar = "<i class='star fa fa-star checked' aria-hidden='true'></i>";
        let fullStar = "<i class='star fa fa-star' aria-hidden='true'></i>"

        for (let i = 0; i < 5; i++) {
            if (i < stars) {
                starsP.append(blankStar);
            } else {
                starsP.append(fullStar);
            }
        }

        const formDiv = $('#form-replace');
        const info = $(".shoe-title");

        // Form replace
        $('#button-replace').on('click', (e) => {
            //console.log(e.currentTarget);
            
            const formAction = "/shoes/"+info.attr('id');
            const login = $(".login-button")
        
            let form = ""
            if (login.attr('id') == "no") {
                form = 
                "<form action='" + formAction + "' class='form text-center' id='comment-form' method='POST'>" +
                    "<input class='form-control mr-sm-2' type='text' placeholder='Title' name='title'>" +
                    "<input class='form-control mr-sm-2' type='text' placeholder='From' name='name'>" +
                    "<textarea style='margin-bottom: 10px' class='form-control' placeholder='Comment' cols='30' rows='5' name='comment'></textarea>" +
                    "<input class='starRating' name='starRating' value='0'>" + 
                "</form>"; 
            } else {
                form = 
                "<form action='" + formAction + "' class='form text-center' id='comment-form' method='POST'>" +
                    "<input class='form-control mr-sm-2' type='text' placeholder='Title' name='title'>" +
                    "<textarea style='margin-bottom: 10px' class='form-control' placeholder='Comment' cols='30' rows='5' name='comment'></textarea>" +
                    "<input class='starRating' name='starRating' value='0'>" +
                "</form>";            
            }
            
            formDiv.html(form);

            let thePost = $('.form');
            let starRating = $('.starRating');
            starRating.hide();

            for (let i = 0; i < 5; i++) {
                let starInput = 
                "<label class='label-star star-" +(i+1)+ "' value='"+ (i+1) +"'><i class='star fa fa-star'></i>"
                thePost.append(starInput);
            }
            thePost.append("<button class='btn btn-outline-success my-2 my-sm-2 btn-lg' type='submit'>Submit</button>");
            let stars = [];
            for (let i = 0; i < 5; i++) {
                stars.push($('.star-'+(i+1)));
                stars[i].on('click', (e) => {
                    e.preventDefault();
                    var value = $(e.currentTarget).attr('value');
                    $(starRating).attr('value', value);
                    console.log(value);
                    for (let q = 0; q < value; q++) {
                        $(stars[q]).addClass('checked');
                    }
                    for (let anotherE = value; anotherE < 5; anotherE++) {
                        $(stars[anotherE]).removeClass('checked');
                    }
                });
            }
        });

        let deleteButton = $('.delete-button');
        if (deleteButton) {
            deleteButton.on('click', (e) => {
                e.preventDefault();
                $(location).attr('href', $(e.currentTarget).attr('href') + "/delete")
            });
        }
    })
}())
