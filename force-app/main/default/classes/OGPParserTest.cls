@isTest
public class OGPParserTest {
    @isTest
    public static void testOGPParser(){
        Test.setMock(HttpCalloutMock.class, new MockHttpResponseGenerator());
        Test.startTest();
        OGPParser.OGP ogp = OGPParser.getMetaProperties('https://www.example.com/') ;
        Test.stopTest();
        System.assertEquals('Test title', ogp.title);
        System.assertEquals('Test description', ogp.description);
        System.assertEquals('https://example.com/example.png', ogp.image);
        System.assertEquals('Example site', ogp.site_name);
    }

    public class MockHttpResponseGenerator implements HttpCalloutMock {
        public HTTPResponse respond(HTTPRequest req) {
            HttpResponse res = new HttpResponse();
            res.setHeader('Content-Type', 'text/html');
            res.setBody('<html><head><meta content="Test title" property="og:title"><meta content="Test description" property="og:description"><meta content="Example site" property="og:site_name"><meta content="https://example.com/example.png" property="og:image"></head><body></body></html>');
            res.setStatusCode(200);
            res.setStatus('OK');
            return res;
        }
    }
}