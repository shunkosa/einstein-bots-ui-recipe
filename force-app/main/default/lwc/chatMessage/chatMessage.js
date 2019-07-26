import BaseChatMessage from 'lightningsnapin/baseChatMessage';
import { track } from 'lwc';

const DEFAULT_MESSAGE_PREFIX = 'PLAIN_TEXT';
const RICHTEXT_MESSAGE_PREFIX = 'RICH_TEXT';
const YOUTUBE_MESSAGE_PREFIX = 'YOUTUBE';
const IMAGE_MESSAGE_PREFIX = 'IMAGE';
const SUPPORTED_MESSAGE_PREFIX = [DEFAULT_MESSAGE_PREFIX, RICHTEXT_MESSAGE_PREFIX, YOUTUBE_MESSAGE_PREFIX, IMAGE_MESSAGE_PREFIX];

/**
 * Displays a chat message using the inherited api messageContent and is styled based on the inherited api userType and messageContent api objects passed in from BaseChatMessage.
 */
export default class ChatMessageDefaultUI extends BaseChatMessage {
    messageType = DEFAULT_MESSAGE_PREFIX;
    @track singleContent = '';
   
    connectedCallback() {
        if (!this.isAgent) {
            return;
        }
        
        const messageTypePrefixPosition = SUPPORTED_MESSAGE_PREFIX.indexOf(this.messageContent.value.split(':')[0]);
        if (messageTypePrefixPosition > -1) {
            this.messageType = SUPPORTED_MESSAGE_PREFIX[messageTypePrefixPosition];
        }
        if (this.isYoutube) {
            this.singleContent = 'https://www.youtube.com/embed/' + this.messageContent.value.split(':')[1];
        } else {
            this.singleContent = this.messageContent.value.replace(this.messageType + ':', '').replace(/&lt;/g,'<').replace(/&gt;/g,'>').replace(/&quot;/g,'\\"');
        }
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
}