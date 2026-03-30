<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    // Get auth tokens from WildFly session
    String tokenId = (String) session.getAttribute("TOKEN_ID");
    if (tokenId == null) tokenId = "";
    String jsessionId = session.getId();

    // Hardcoded editor parameters (matching editor-wrapper.component.ts defaults)
    String objName = "sorder";
    String editFlag = "A";
    String pkValues = "";
    String editorId = String.valueOf((int)(100000000 + Math.random() * 900000000));
    String objCtx = "1";
    String refSer = "S-ORD";
    String noOfForms = "4";

    // Build iframe URL with hash parameters (including auth tokens so Angular can read them before routing)
    String iframeSrc = request.getContextPath()
        + "/E12BROWSER/simpleditorplugin/index.html#/editor"
        + "?OBJ_NAME=" + objName
        + "&EDIT_FLAG=" + editFlag
        + "&PK_VALUES=" + pkValues
        + "&EDITOR_ID=" + editorId
        + "&OBJ_CTX=" + objCtx
        + "&REF_SER=" + refSer
        + "&NO_OF_FORMS=" + noOfForms
        + "&TOKEN_ID=" + tokenId
        + "&JSESSIONID=" + jsessionId;
%>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Simple Editor</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        html, body {
            width: 100%;
            height: 100%;
            overflow: hidden;
        }
        #simpleEditorFrame {
            width: 100%;
            height: 100vh;
            border: none;
        }
    </style>
</head>
<body>
    <iframe
        id="simpleEditorFrame"
        src="<%= iframeSrc %>"
        allow="clipboard-read; clipboard-write">
    </iframe>

    <script>
        var iframe = document.getElementById('simpleEditorFrame');
        iframe.onload = function() {
            // Send auth tokens to the Angular app via postMessage
            iframe.contentWindow.postMessage({
                type: 'AUTH_INIT',
                TOKEN_ID: '<%= tokenId %>',
                JSESSIONID: '<%= jsessionId %>'
            }, window.location.origin);
        };
    </script>
</body>
</html>
