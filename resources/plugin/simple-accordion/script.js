// toggle
$(function(){
	$('.toggle').click(function(e) {
		e.preventDefault();
	  
		var obj = $(this);
	  
		if (obj.next().hasClass('show')) {
			obj.next().removeClass('show');
			obj.next().slideUp(350);
		} else {
			obj.parent().parent().find('li .inner').removeClass('show');
			obj.parent().parent().find('li .inner').slideUp(350);
			obj.next().toggleClass('show');
			obj.next().slideToggle(350);
		}
	});
});
