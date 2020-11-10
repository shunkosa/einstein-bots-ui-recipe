import BaseChatMessage from 'lightningsnapin/baseChatMessage';
import { track } from 'lwc';
import { loadStyle } from 'lightning/platformResourceLoader';
import chatMessageStyle from '@salesforce/resourceUrl/chatMessageStyle';

const DEFAULT_MESSAGE_PREFIX = 'PLAIN_TEXT';
const RICHTEXT_MESSAGE_PREFIX = 'RICH_TEXT';
const YOUTUBE_MESSAGE_PREFIX = 'YOUTUBE';
const IMAGE_MESSAGE_PREFIX = 'IMAGE';
const URL_MESSAGE_PREFIX = 'URL'
const NAVIGATE_MESSAGE_PREFIX = 'NAVIGATE';
const SUPPORTED_MESSAGE_PREFIX = [DEFAULT_MESSAGE_PREFIX, RICHTEXT_MESSAGE_PREFIX, YOUTUBE_MESSAGE_PREFIX, IMAGE_MESSAGE_PREFIX, URL_MESSAGE_PREFIX, NAVIGATE_MESSAGE_PREFIX];
const OPENGRAPH_API_KEY = 'YOUR_OPENGRAPH_API_KEY';

/**
 * Displays a chat message using the inherited api messageContent and is styled based on the inherited api userType and messageContent api objects passed in from BaseChatMessage.
 */
export default class ChatMessageDefaultUI extends BaseChatMessage {
    messageType = DEFAULT_MESSAGE_PREFIX;
    @track content = '';
    @track ogpMeta = {};
    connectedCallback() {
        if (!this.isAgent) {
            return;
        }
        const messageTypePrefixPosition = SUPPORTED_MESSAGE_PREFIX.indexOf(this.messageContent.value.split(':')[0]);
        if (messageTypePrefixPosition > -1) {
            this.messageType = SUPPORTED_MESSAGE_PREFIX[messageTypePrefixPosition];
        }
        const contentValue = (this.messageContent.value.split(this.messageType + ':').length === 1) ? this.messageContent.value : this.messageContent.value.split(this.messageType + ':')[1];
        Promise.all([
            loadStyle(this, chatMessageStyle + '/style.css')
        ]);
        if (this.isPlainText) {
            this.content = contentValue;
        } else if (this.isYoutube) {
            this.content = 'https://www.youtube.com/embed/' + contentValue
        } else if (this.isNavigate) {
            const url = this.extractOriginalUrl(contentValue);
            window.open(url);
            this.content = `Opening ${url}`;
        } else if (this.isImage) {
            this.content = this.extractOriginalUrl(contentValue);
        } else if (this.isUrl) {
            this.content = this.extractOriginalUrl(contentValue);
            const urlEncoded = encodeURIComponent(this.content);
            const requestURL = 'https://opengraph.io/api/1.1/site/' + urlEncoded + '?app_id=' + OPENGRAPH_API_KEY;
            fetch(requestURL, { method: "GET" })
                .then(response => {
                    return response.json();
                })
                .then(jsonResponse => {
                    if(jsonResponse.hybridGraph) {
                        this.ogpMeta.title = jsonResponse.hybridGraph.title;
                        this.ogpMeta.description = jsonResponse.hybridGraph.description;
                        this.ogpMeta.image = jsonResponse.hybridGraph.image;
                        this.ogpMeta.site_name = jsonResponse.hybridGraph.site_name;
                    }
                })
        } else {
            this.content = contentValue
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '\"')
                .replace(/<a href='mailto:.*?' target='_blank'>(.*?)<\/a>/g, '$1')
                .replace(/<a href='/g, '')
                .replace(/' target='_blank'.*?<\/a>( +)/g, '$1')
                .replace(/' target='_blank'.*?<\/a>.*?<\/a>/g, '');
        }
    }

    extractOriginalUrl(generatedString) {
        const matched = generatedString.match(/<a href.+>(.*?)<\/a>/);
        if (matched.length > 1) {
            return matched[1];
        }
        return generatedString;
    }

    fallback(event) {
        event.target.onerror = null;
        event.target.style.display = 'none';
        event.target.style.height = 0;
    }

    get isAgent() {
        return this.userType === 'agent';
    }

    get isPlainText() {
        return this.messageType === DEFAULT_MESSAGE_PREFIX;
    }

    get isRichText() {
        return this.messageType === RICHTEXT_MESSAGE_PREFIX;
    }

    get isYoutube() {
        return this.messageType === YOUTUBE_MESSAGE_PREFIX;
    }

    get isImage() {
        return this.messageType === IMAGE_MESSAGE_PREFIX;
    }

    get isUrl() {
        return this.messageType === URL_MESSAGE_PREFIX;
    }

    get isNavigate() {
        return this.messageType === NAVIGATE_MESSAGE_PREFIX;
    }

    get hasOGPInfo() {
        return this.ogpMeta.title !== undefined;
    }
}