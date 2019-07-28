public with sharing class OGPParser {
    public class OGP {
        @AuraEnabled
        public String title {get; set;}
        @AuraEnabled
        public String description {get; set;}
        @AuraEnabled
        public String image {get; set;}
        @AuraEnabled
        public String site_name {get; set;}
    }

    @AuraEnabled
    public static OGP getMetaProperties(String url) {
        HttpRequest req = new HttpRequest();
        req.setEndpoint(url);
        req.setMethod('GET');
        HttpResponse res = new Http().send(req);

        OGP result = new OGP();
        if(!res.getStatus().equals('OK')) {
            return result;
        } 
        Pattern pattern = Pattern.compile('<meta[^<>]+>');
        Matcher matcher = pattern.matcher(res.getBody());   
        while(matcher.find()){
            String currentMeta = matcher.group();
            if(currentMeta.contains('og:title')) {
                result.title = getContent(currentMeta);
            } else if(currentMeta.contains('og:description')) {
                result.description = getContent(currentMeta);
            } else if(currentMeta.contains('og:image')) {
                result.image = getContent(currentMeta);
            } else if(currentMeta.contains('og:site_name')) {
                result.site_name = getContent(currentMeta);
            } 
        }
        return result;
    }

    private static String getContent(String meta) {
        Pattern pattern = Pattern.compile('(?m).+content=["\']([\\s\\S]*?)["\']');
        Matcher matcher = pattern.matcher(meta);
        if(matcher.find()) {
            return matcher.group(1);
        } 
        return null;
    }
}
