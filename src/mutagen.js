/* 
==ZubZero wins==

Html smart parser for replacing one html chunks to other html content.
See more info on http://github.com/abstudio/subzero

Author: Vladimir Kalmykov (Morulus)
Email: vladimirmorulus@gmail.com
MIT License 2015
*/

/*
QuerySelector polyfill
*/
(function(name, depends, factory) {
	if (window && window.define && "function"===typeof define) define(name, depends, factory)
	else {
		String.prototype.mutate = factory();
	}
})
("subzero", ["polyvitamins~querySelector@0.0.3"], function(extendedQuerySelector) {
	
	var regPseudoClasssDt = /:(eq|nth\-child)\(([0-9n\+ ]+)\)/ig,
	queryExpr = /<([a-zA-Z0-9_]+) \/>/i,
	argsExpr = /\[([a-zA-Z0-9_\-]*)[ ]?=([ ]?[^\]]*)\]/i;
	
		/*
		Выборка элементов соответствующих псевдо-селектору
		*/
		var psopi = {
			"eq": function(elements, attrs) {
				var index;
				if (!isNaN(index = parseInt(attrs[2]))) {
					return [(index<0 && index*-1<elements.length) ? elements[elements.length-index] :
					(index<elements.length ? elements[index] : [])];
				} else {
					return [];
				}
			},
			"nth-child": function(elements, attrs) {

				var n=false,i=0,rec=[],index;
				if (!isNaN(index = parseInt(attrs[2]))) {

					n=attrs[2].indexOf('n')>=0;
					for (;i<elements.length;i++) {
						if (!n&&i===index) rec.push(elements[i]);
						if (n&&i%index===0) rec.push(elements[i]);
					}
				} else {

					return [];
				}
				return rec;
			}
		}
		var pseusoSelect = function(elements, selector) {
			var psop = regPseudoClasssDt.exec(selector);

			if ("function"!==typeof psopi[psop[1]]) {
				return [];
			} else {
				return psopi[psop[1]](elements, psop);
			}
		},
		each = function(subject, fn) {
			for (var prop in subject) {
				if (subject.hasOwnProperty(prop)) {
					fn.call(subject, subject[prop], prop);
				}
			}
		},
		regPlaceholder = /\{\{([^\} \.]+)([\.a-zA-Z0-9_]*)\}\}/gi;

		var Mutagen = function(htmlElement, preProcessor) {
			/*
			Search for all placeholders
			*/
			var template = this,
			matches = template.match(regPlaceholder),
			replacings = {};
			
			matches.forEach(function(dph) {
				regPlaceholder.lastIndex = 0;
				var placeholderData = regPlaceholder.exec(dph),
				placeholder = placeholderData[1],
				keyname = placeholderData[2]!==""?placeholderData[2].substr(1) : 'innerHTML';
				
				if ("undefined"!==typeof replacings[placeholder]) return true;
				replacings[dph] = '';

				if (placeholder==='content') {
					replacings[dph] = htmlElement.innerHTML;
				} else {
					var elements = extendedQuerySelector(placeholder, htmlElement);
					if (elements) {
						replacings[dph] = "undefined"!==typeof elements[0] ? elements[0][keyname] : "";
					}
				}
			});
			if ("function"===typeof preProcessor) preProcessor.call(htmlElement, replacings);

			each(replacings, function(content, ph) {
				template = template.replace(ph, content);
			});
			htmlElement.innerHTML = template;
			return template;
		}

		Mutagen.query = extendedQuerySelector;

		return Mutagen;
});