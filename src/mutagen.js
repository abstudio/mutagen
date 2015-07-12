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
("subzero", ["polyvitamins~querySelector@0.0.4"], function(extendedQuerySelector) {
		var each = function(subject, fn) {
			for (var prop in subject) {
				if (subject.hasOwnProperty(prop)) {
					fn.call(subject, subject[prop], prop);
				}
			}
		},
		regPlaceholder = /\{\{([^\} \.]+)([\.a-zA-Z0-9_]*)\}\}/gi;

		var Mutagen = function(htmlElement, preProcessor, postProcessor) {
             var template = this, matches = template.match(regPlaceholder), replacings = {};
            if ("function" === typeof preProcessor) preProcessor.call(htmlElement, replacings);
            
            if (matches!==null)
            matches.forEach(function(dph) {
                regPlaceholder.lastIndex = 0;
                var placeholderData = regPlaceholder.exec(dph), placeholder = placeholderData[1], keyname = placeholderData[2] !== "" ? placeholderData[2].substr(1) : "innerHTML";
                if ("undefined" !== typeof replacings[placeholder]) return true;
                replacings[dph] = replacings[dph] || "";
                if (placeholder === "content") {
                    replacings[dph] = htmlElement.innerHTML;
                } else {
                    var elements = extendedQuerySelector(placeholder, htmlElement);
                    if (elements) {
                        replacings[dph] = "undefined" !== typeof elements[0] ? elements[0][keyname] : replacings[dph] || "";
                    }
                }
            });
            
            each(replacings, function(content, ph) {
                template = template.replace(ph, content);
            });
            if ("function" === typeof postProcessor) postProcessor.call(htmlElement, template);
            htmlElement.innerHTML = template;
            return template;
        };

		Mutagen.query = extendedQuerySelector;

		return Mutagen;
});