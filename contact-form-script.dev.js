var widgetId1,widgetId2,widgetId3;
var CaptchaCallback = function() {
        widgetId1 = grecaptcha.render('RecaptchaField1', {'sitekey' : '6LdwRTsUAAAAALHp5DqB1RwAXOAMSpATDltk_foU'});
        widgetId2 = grecaptcha.render('RecaptchaField2', {'sitekey' : '6LdwRTsUAAAAALHp5DqB1RwAXOAMSpATDltk_foU'});
		widgetId3 = grecaptcha.render('RecaptchaField3', {'sitekey' : '6LdwRTsUAAAAALHp5DqB1RwAXOAMSpATDltk_foU'});
    };

var verifyCallback = function(response) {
	var form = $(location.hash);
	var id = $('.active')[0].id;
	var widget = getActiveReCaptchaWidget(id);
	
	if(form.hasClass('active')){
		if(grecaptcha.getResponse(widget).length > 0){
			form.find(".g-recaptcha").attr("data-validate", 1);
		}
		else{
			form.find(".g-recaptcha").attr("data-validate", 0);
			reCaptchaReset(id);
		}
	}
};

$(".contactForm").on('reset', function(e){
	e.stopPropagation();
	fields = $('.active  form > .field input, .active  form > .field textarea');
	fields.val('');
	fields.removeClass('error');
	$(".active .g-recaptcha > div").removeClass();

	reCaptchaReset($('.active')[0].id);
});


$(".contactForm").validator().on("submit", function (event) {
    if (event.isDefaultPrevented()) {
		// handle the invalid form...
        formError();
        submitMSG(false, "Revisa todos los campos del formulario");
    } else {
       	// everything looks good!
        event.preventDefault();
        submitForm($(this));
    }
});



function submitForm(form){
	if(!form) return;
    // Initiate Variables With Form Content
    var name = form.find("#name").val();
    var email = form.find("#email").val();
    var msg_subject = form.find("#asunto").val();
    var message = form.find("#message").val();
	var validate = form.find(".g-recaptcha").attr("data-validate") == 1 || false;
	var buyBTC = form.parent('#buyBTC').attr('data-buyBTC') == 1 || '';
	var investBTC = form.parent('#investBTC').attr('data-investBTC') == 1 || '';
	
	checkFields();
	
	if(validate){
		if(name && email && msg_subject && message){
			$.ajax({
			type: "POST",
			url: "/assets/email/form-process.php",
			dataType: 'json',
			data: "name=" + name + "&email=" + email + "&msg_subject=" + msg_subject + "&buyBTC="+buyBTC+ "&investBTC="+investBTC+ 
			"&message=" + message + "&captcha =" + 1,
			success : function(result){
					if (result.data == "success"){
						formSuccess();
					}
					else {
						formError();
						submitMSG(false,result.data);
					}
				}
			});
	}
	else submitMSG(false,"Revisa todos los campos del formulario");

	}
	else submitMSG(false,"Debes completar el captcha");
}

function formSuccess(){
    $(".active .contactForm")[0].reset();
    submitMSG(true, "Mensaje enviado correctamente");

	reCaptchaReset($('.active')[0].id);
}

function formError(){
    $(".active .contactForm").removeClass().addClass('shake animated').one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
        $(this).removeClass();
    });
	$(".active .g-recaptcha").attr("data-validate",0);
	checkFields();

	reCaptchaReset($('.active')[0].id);
}

function checkFields(){
	fields = $('.active form > .field input, .active form > .field textarea');
	fields.push($(".active .g-recaptcha > div"));
	
	fields.each(function(){
		if($(this).val()=="") $(this).addClass('error');
		else $(this).removeClass();
	});
}

function submitMSG(valid, msg){
	if(valid){
		var msgClasses = "text-success";
	}
	else {
		var msgClasses = "text-danger";
	}
	$(".msgSubmit").removeClass().addClass('msgSubmit ' + msgClasses).text(msg);
	$('.msgSubmit').fadeIn(500);
	setTimeout(function(){hideMSG()},5500);
}

function reCaptchaReset(id){
	var widget = getActiveReCaptchaWidget(id);
	grecaptcha.reset(widget);
	if($(".active .g-recaptcha > div").hasClass("error")) $(".active .g-recaptcha > div").removeClass('error');
}

function hideMSG(){
	$('.msgSubmit').fadeOut(2500);
}

function getActiveReCaptchaWidget(id){
	var widget;
		switch(id){
		case 'contact': widget = widgetId1; break;
		case 'buyBTC': widget = widgetId2; break;
		case 'investBTC': widget = widgetId3; break;
		default: break;
	}
	return widget;
}