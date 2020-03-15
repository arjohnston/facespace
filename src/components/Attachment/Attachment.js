import React, { Component } from 'react'
import './style.css'

const DRAG_ENUM = {
  idle: 0,
  dragging: 1,
  uploading: 2,
  complete: 3
}

export default class Attachment extends Component {
  constructor (props) {
    super(props)
    this.state = {
      attachmentDragState: DRAG_ENUM.idle,
      dragging: false
    }

    this.dropRef = React.createRef()
    this.handleDragIn = this.handleDragIn.bind(this)
    this.handleDragOut = this.handleDragOut.bind(this)
    this.handleDrag = this.handleDrag.bind(this)
    this.handleDrop = this.handleDrop.bind(this)
    this.handleFileInput = this.handleFileInput.bind(this)
  }

  componentDidMount () {
    const div = this.dropRef.current
    div.addEventListener('dragenter', this.handleDragIn)
    div.addEventListener('dragleave', this.handleDragOut)
    div.addEventListener('dragover', this.handleDrag)
    div.addEventListener('drop', this.handleDrop)

    this.dragCounter = 0
  }

  componentWillUnmount () {
    const div = this.dropRef.current
    div.removeEventListener('dragenter', this.handleDragIn)
    div.removeEventListener('dragleave', this.handleDragOut)
    div.removeEventListener('dragover', this.handleDrag)
    div.removeEventListener('drop', this.handleDrop)
  }

  handleDrag (e) {
    e.preventDefault()
    e.stopPropagation()
  }

  handleDragIn (e) {
    e.preventDefault()
    e.stopPropagation()

    this.dragCounter++
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      this.setState({
        dragging: true,
        attachmentDragState: DRAG_ENUM.uploading
      })
    }
  }

  handleDragOut (e) {
    e.preventDefault()
    e.stopPropagation()

    this.dragCounter--
    if (this.dragCounter > 0) return

    this.setState({
      dragging: false,
      attachmentDragState: DRAG_ENUM.idle
    })
  }

  handleDrop (e) {
    e.preventDefault()
    e.stopPropagation()

    const files = e.dataTransfer.files

    this.setState(
      {
        dragging: false,
        attachmentDragState: DRAG_ENUM.complete
      },
      () => {
        setTimeout(
          function () {
            if (files && files.length > 0) {
              this.props.onFileInput(files)
              this.dragCounter = 0
            }

            this.setState({
              attachmentDragState: DRAG_ENUM.idle
            })
          }.bind(this),
          2000
        )
      }
    )
  }

  handleToggleAttachmentInputShown () {
    this.props.onCloseAttachment()
  }

  handleFileInput (e) {
    const files = e.target.files

    this.setState(
      {
        dragging: false,
        attachmentDragState: DRAG_ENUM.complete
      },
      () => {
        setTimeout(
          function () {
            if (files && files.length > 0) {
              this.props.onFileInput(files)
              this.dragCounter = 0
            }

            this.setState({
              attachmentDragState: DRAG_ENUM.idle
            })
          }.bind(this),
          2000
        )
      }
    )
  }

  render () {
    let classes = ''
    switch (this.state.attachmentDragState) {
      case DRAG_ENUM.idle:
        classes = 'idle'
        break

      case DRAG_ENUM.dragging:
        classes = 'dragging'
        break

      case DRAG_ENUM.uploading:
        classes = 'uploading'
        break

      case DRAG_ENUM.complete:
        classes = 'complete'
        break

      default:
        classes = 'idle'
    }

    return (
      <div className='attachment-input-wrapper'>
        <div className='attachment-input' ref={this.dropRef}>
          <div className='attachment-input-title'>File Upload</div>
          <div className='attachment-drag-drop'>
            <div className={`upload-wrapper ${classes}`}>
              <div className='upload-img'>
                <svg viewBox='0 0 24 24' className='upload-arrow'>
                  <path d='M15,20H9V12H4.16L12,4.16L19.84,12H15V20Z' />
                </svg>

                <svg viewBox='0 0 24 24' className='upload-image'>
                  <path d='M19,19H5V5H19M19,3H5A2,2 0 0,0 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5A2,2 0 0,0 19,3M13.96,12.29L11.21,15.83L9.25,13.47L6.5,17H17.5L13.96,12.29Z' />
                </svg>

                <svg viewBox='0 0 24 24' className='upload-checkmark'>
                  <path d='M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z' />
                </svg>
              </div>

              <div className='pulse' />
            </div>
            <span>Drag images to upload, or</span>
          </div>
          <label htmlFor='file-upload'>
            Choose File
            <input
              name='file-upload'
              id='file-upload'
              type='file'
              accept='image/*'
              onChange={this.handleFileInput}
            />
          </label>

          <div
            className='attachment-input-close-button'
            onClick={this.handleToggleAttachmentInputShown.bind(this)}
          >
            <svg width='24' height='24'>
              <path
                fill='#555'
                d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z'
              />
            </svg>
          </div>
        </div>
      </div>
    )
  }
}
