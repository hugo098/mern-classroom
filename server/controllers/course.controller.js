import Course from '../models/course.model'
import extend from 'lodash/extend'
import fs from 'fs'
import errorHandler from './../helpers/dbErrorHandler'
import formidable from 'formidable'
import defaultImage from './../../client/assets/images/default.png'


const listByInstructor = (req, res) => {
    Course.find({ instructor: req.profile._id }, (err, courses) => {
        if (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
        res.json(courses)
    }).populate('instructor', '_id name')
}

const create = (req, res) => {
    let form = new formidable.IncomingForm()
    form.keepExtensions = true
    form.parse(req, async (err, fields, files) => {
        if (err) {
            return res.status(400).json({
                error: "Image could not be uploaded"
            })
        }
        let course = new Course(fields)
        course.instructor = req.profile
        if (files.image) {
            course.image.data = fs.readFileSync(files.image.path)
            course.image.contentType = files.image.type
        }
        try {
            let result = await course.save()
            res.json(result)
        } catch (err) {
            return res.status(400).json({
                error: errorHandler.getErrorMessage(err)
            })
        }
    })
}

const read = (req, res) => {
    req.course.image = undefined
    return res.json(req.course)
}

const photo = (req, res, next) => {
    if (req.course.image.data) {
        res.set("Content-Type", req.course.image.contentType)
        return res.send(req.course.image.data)
    }
    next()
}
const defaultPhoto = (req, res) => {
    return res.sendFile(process.cwd() + defaultImage)
}

/**
 * Load course and append to req.
 */
const courseByID = async (req, res, next, id) => {
    try {
        let course = await Course.findById(id).populate('instructor', '_id name')
        if (!course)
            return res.status('400').json({
                error: "Course not found"
            })
        req.course = course
        next()
    } catch (err) {
        return res.status('400').json({
            error: "Could not retrieve course"
        })
    }
}

export default { create, photo, defaultPhoto, listByInstructor, courseByID, read }