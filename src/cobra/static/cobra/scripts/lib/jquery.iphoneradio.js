/*
 * iphone开关样式
 */
(function (document, $, log) {

	$.fn.tzCheckbox = function(options){
		// Default On / Off labels:
		
		options = $.extend({
			labels : ['ON','OFF']
		},options);
		
		return this.each(function(){
			var originalCheckBox = $(this),
				labels = [];
			
			// Checking for the data-on / data-off HTML5 data attributes:
			if(originalCheckBox.data('on')){
				labels[0] = originalCheckBox.data('on');
				labels[1] = originalCheckBox.data('off');
			}
			else labels = options.labels;

			// Creating the new checkbox markup:
			var checkBox = $('<span>',{
				"class": 'tzCheckBox e-range '+(this.checked?'open checked':''),
				"html":	'<span class="tzCBContent">'+labels[this.checked?0:1]+
						'</span><span class="tzCBPart"></span>'
			});
			if(originalCheckBox.attr('disabled')){
				checkBox.attr("title",'已禁用').attr('disabled',true);
			}
			// Inserting the new checkbox, and hiding the original:
			if(originalCheckBox.next().is("span") && (originalCheckBox.next().attr("class")==="tzCheckBox e-range " || originalCheckBox.next().attr("class")==="tzCheckBox e-range open checked")){
				
			}else{
				checkBox.insertAfter(originalCheckBox.hide());
			}

			checkBox.click(function(){
				if(originalCheckBox.attr('disabled')) return;
				checkBox.toggleClass('open checked');				
				var isChecked = checkBox.hasClass('open checked');	
				// Synchronizing the original checkbox:
				originalCheckBox.prop('checked',isChecked);
				originalCheckBox.trigger("click");
				originalCheckBox.prop('checked',isChecked);
				checkBox.find('.tzCBContent').html(labels[isChecked?0:1]);
			});
			
			// Listening for changes on the original and affecting the new one:
		});
	};

}(document, jQuery, function (msg) {window.console && console.log(msg)}));
