/**
 * @author Harshada
 * 
 * Include this javaScript file reference in MobileE12.html & Login.html
 * <br>You can define custom javaScript functions for GWT components
 * and call using JSNI GWT functionality 
 */

var cnt = 0;
/**
 * Sample JavaScript function returning count
 * <br>Modify this method signature & implementation as per requirement
 * @returns {Number}
 */
function callJsMethod() {
	cnt++;
	return cnt;
}