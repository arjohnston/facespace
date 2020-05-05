import React, { Component } from 'react'
import './style.css'
import { connect } from 'react-redux'
import AttachmentInput from '../Attachment/Attachment'

import 'emoji-mart/css/emoji-mart.css'
import { Picker } from 'emoji-mart'

export class CreatePost extends Component {
  constructor (props) {
    super(props)
    this.state = {
      postText: '',
      attachmentInputShown: false,
      imageLoadedSrc: '',
      imageLoadedName: '',
      openImageViewer: false,
      imageViewerSrc: '',
      imageViewerName: ''
    }
    this.handlePostTextChange = this.handlePostTextChange.bind(this)
    this.handleCreatePost = this.handleCreatePost.bind(this)
    this.handleToggleAttachmentInputShown = this.handleToggleAttachmentInputShown.bind(
      this
    )
    this.handleFileInput = this.handleFileInput.bind(this)
    this.handleDeleteImage = this.handleDeleteImage.bind(this)

    this.handleEmojiMouseEnter = this.handleEmojiMouseEnter.bind(this)
    this.handleEmojiMouseLeave = this.handleEmojiMouseLeave.bind(this)
  }

  handleToggleAttachmentInputShown () {
    this.setState({
      attachmentInputShown: !this.state.attachmentInputShown
    })
  }

  handleFileInput (files) {
    // Save file
    if (files && files[0]) {
      const reader = new FileReader()
      reader.readAsDataURL(files[0])

      reader.onload = readerEvent => {
        this.setState({
          imageLoadedSrc: readerEvent.target.result,
          imageLoadedName: files[0].name
        })
      }
    }

    this.handleToggleAttachmentInputShown()
  }

  handleDeleteImage () {
    this.setState({
      imageLoadedSrc: '',
      imageLoadedName: ''
    })
  }

  toggleOpenImageViewer (message) {
    this.setState({
      openImageViewer: message !== null,
      imageViewerSrc: message === null ? '' : message.data,
      imageViewerName: message === null ? '' : message.name
    })
  }

  handleSelectEmoji (e) {
    this.setState({
      postText: this.state.postText + e,
      emojiMenuOpen: false
    })
  }

  handleEmojiMouseEnter () {
    this.setState({
      emojiMenuOpen: true
    })
  }

  handleEmojiMouseLeave () {
    this.setState({
      emojiMenuOpen: false
    })
  }

  // function
  handlePostTextChange (event) {
    this.setState({
      postText: event.target.value
    })
  }

  // function for creating post
  handleCreatePost () {
    const post = {
      text: this.state.postText,
      imageData: this.state.imageLoadedSrc,
      imageName: this.state.imageLoadedName
    }
    this.props.createPost(post)
    this.setState({
      postText: '',
      imageLoadedSrc: '',
      imageLoadedName: '',
      openImageViewer: false,
      imageViewerSrc: '',
      imageViewerName: ''
    })
  }

  render () {
    return (
      <div className='create-post-container'>
        <div
          style={{
            display: this.state.attachmentInputShown ? 'block' : 'none'
          }}
        >
          <AttachmentInput
            onCloseAttachment={this.handleToggleAttachmentInputShown}
            onFileInput={this.handleFileInput}
            isOpen={this.state.attachmentInputShown}
          />
        </div>
        <div className='create-post-input'>
          {this.props.user.profileImg ? (
            <div className='create-post-profile-img'>
              <img
                src={this.props.user.profileImg}
                alt={`${this.state.firstName} ${this.state.lastName}`}
              />
            </div>
          ) : (
            <svg className='profile-svg' viewBox='0 0 24 24'>
              <path d='M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z' />
            </svg>
          )}

          <svg viewBox='0 0 24 24'>
            <path d='M8,12H16V14H8V12M10,20H6V4H13V9H18V12.1L20,10.1V8L14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H10V20M8,18H12.1L13,17.1V16H8V18M20.2,13C20.3,13 20.5,13.1 20.6,13.2L21.9,14.5C22.1,14.7 22.1,15.1 21.9,15.3L20.9,16.3L18.8,14.2L19.8,13.2C19.9,13.1 20,13 20.2,13M20.2,16.9L14.1,23H12V20.9L18.1,14.8L20.2,16.9Z' />
          </svg>

          {this.state.imageLoadedSrc && this.state.imageLoadedName ? (
            <div className='message-input-image'>
              <img
                src={this.state.imageLoadedSrc}
                alt={this.state.imageLoadedName}
              />
              <div className='message-input-image-title'>
                <span>{this.state.imageLoadedName}</span>
                <svg viewBox='0 0 24 24' onClick={this.handleDeleteImage}>
                  <path d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' />
                </svg>
              </div>
            </div>
          ) : (
            <textarea
              className='create-text-area'
              placeholder='Whats on your mind?'
              value={this.state.postText}
              onChange={this.handlePostTextChange}
            />
          )}
        </div>

        <div className='create-post-cta'>
          <div
            className='attachment-wrapper'
            onClick={this.handleToggleAttachmentInputShown.bind(this)}
          >
            <svg viewBox='0 0 24 24'>
              <path d='M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z' />
            </svg>
          </div>
          <div
            style={{ alignItems: 'center' }}
            className={`emoji-wrapper ${
              this.state.emojiMenuOpen ? 'is-open' : ''
            }`}
            onMouseEnter={this.handleEmojiMouseEnter}
            onMouseLeave={this.handleEmojiMouseLeave}
          >
            <svg viewBox='0 0 24 24'>
              <path d='M12,17.5C14.33,17.5 16.3,16.04 17.11,14H6.89C7.69,16.04 9.67,17.5 12,17.5M8.5,11A1.5,1.5 0 0,0 10,9.5A1.5,1.5 0 0,0 8.5,8A1.5,1.5 0 0,0 7,9.5A1.5,1.5 0 0,0 8.5,11M15.5,11A1.5,1.5 0 0,0 17,9.5A1.5,1.5 0 0,0 15.5,8A1.5,1.5 0 0,0 14,9.5A1.5,1.5 0 0,0 15.5,11M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2C6.47,2 2,6.5 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' />
            </svg>

            <div className='emoji-picker'>
              <Picker
                title={null}
                showPreview={false}
                showSkinTones={false}
                style={{ position: 'absolute', top: '0px', right: '0px' }}
                onClick={emoji => this.handleSelectEmoji(emoji.native)}
              />
            </div>
          </div>

          <input
            onClick={this.handleCreatePost}
            type='submit'
            value='Post'
            className='create-post-submit-button'
          />
        </div>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  ...state
})

export default connect(mapStateToProps)(CreatePost)
