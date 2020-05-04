const express = require('express')
const jwt = require('jsonwebtoken')
const router = express.Router()
const mongoose = require('mongoose')
const User = require('../models/User')
const config = require('../../util/settings')

const {
  OK,
  NOT_FOUND,
  UNAUTHORIZED,
  BAD_REQUEST,
  CONFLICT
} = require('../../util/statusCodes')

router.post('/changePassword')
