import BaseChatMessage from 'lightningsnapin/baseChatMessage';
import { track } from 'lwc';
import getMetaProperties from '@salesforce/apex/OGPParser.getMetaProperties'

const DEFAULT_MESSAGE_PREFIX = 'PLAIN_TEXT';
const RICHTEXT_MESSAGE_PREFIX = 'RICH_TEXT';
const YOUTUBE_MESSAGE_PREFIX = 'YOUTUBE';
const IMAGE_MESSAGE_PREFIX = 'IMAGE';
const URL_MESSAGE_PREFIX = 'URL'
const SUPPORTED_MESSAGE_PREFIX = [DEFAULT_MESSAGE_PREFIX, RICHTEXT_MESSAGE_PREFIX, YOUTUBE_MESSAGE_PREFIX, IMAGE_MESSAGE_PREFIX, URL_MESSAGE_PREFIX];

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
        console.log(this.messageContent.value);
        const messageTypePrefixPosition = SUPPORTED_MESSAGE_PREFIX.indexOf(this.messageContent.value.split(':')[0]);
        if (messageTypePrefixPosition > -1) {
            this.messageType = SUPPORTED_MESSAGE_PREFIX[messageTypePrefixPosition];
        }
        const contentValue = (this.messageContent.value.split(this.messageType + ':').length === 1) ? this.messageContent.value : this.messageContent.value.split(this.messageType + ':')[1];
        if (this.isPlainText) {
            this.content = contentValue;
        } else if (this.isYoutube) {
            this.content = 'https://www.youtube.com/embed/' + contentValue
        } else if (this.isImage) {
            this.content = this.extractOriginalString(contentValue);
        } else if (this.isUrl) {
            this.content = this.extractOriginalString(contentValue);
            getMetaProperties({ url : this.content })
            .then(result => {
                this.ogpMeta = result;
            })
            .catch(error => {
                console.log(error.body);
            });
        } else {
            this.content = contentValue
                .replace(/&lt;/g, '<')
                .replace(/&gt;/g, '>')
                .replace(/&quot;/g, '\\"');
        }
    }

    extractOriginalString(generatedString) {
        const matched = generatedString.match(/<a href.+>(.*?)<\/a>/);
        if (matched.length > 1) {
            return matched[1];
        }
        return generatedString;
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
}