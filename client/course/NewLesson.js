import { Button, Dialog, DialogActions, DialogContent, DialogTitle, makeStyles, TextField } from "@material-ui/core"
import React, { useState } from "react"
import PropTypes from 'prop-types'
import { Add } from "@material-ui/icons"
import auth from "../auth/auth-helper"
import { newLesson } from "./api-course"

const useStyles = makeStyles(theme => ({
    form: {
        minWidth: 500
    }
}))

export default function NewLesson(props) {
    const classes = useStyles()
    const [open, setOpen] = useState(false)
    const [values, setValues] = useState({
        title: '',
        content: '',
        resource_url: ''
    })

    const handleClickOpen = () => {
        setOpen(true)
    }
    const handleClose = () => {
        setOpen(false)
    }
    const handleChange = name => event => {
        setValues({ ...values, [name]: event.target.value })
    }

    const clickSubmit = () => {
        const jwt = auth.isAuthenticated()
        const lesson = {
            title: values.title || undefined,
            content: values.content || undefined,
            resource_url: values.resource_url || undefined
        }
        newLesson({
            courseId: props.courseId
        }, {
            t: jwt.token
        }, lesson).then((data) => {
            if (data && data.error) {
                setValues({ ...values, error: data.error })
            } else {
                props.addLesson(data)
                setValues({
                    ...values, title: '',
                    content: '',
                    resource_url: ''
                })
                setOpen(false)
            }
        })
    }

    return (
        <div>
            <Button aria-label="Add Lesson" color="primary" variant="contained"
                onClick={handleClickOpen}>
                <Add />&nbsp; New Lesson
            </Button>
            <Dialog open={open} onClose={handleClose} aria-labelledby="formdialog-title">
                <div className={classes.form}>
                    <DialogTitle id="form-dialog-title">Add New Lesson</DialogTitle>
                    <DialogContent>
                        <TextField
                            margin="dense"
                            label="Title"
                            type="text"
                            fullWidth
                            value={values.title} onChange={handleChange('title')}
                        /><br />
                        <TextField
                            margin="dense"
                            label="Content"
                            type="text"
                            multiline
                            rows="5"
                            fullWidth
                            value={values.content} onChange={handleChange('content')}
                        /><br />
                        <TextField
                            margin="dense"
                            label="Resource link"
                            type="text"
                            fullWidth
                            value={values.resource_url} onChange={handleChange('resource_url')}
                        /><br />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose}
                            color="primary" variant="contained">
                            Cancel
                        </Button>
                        <Button onClick={clickSubmit}
                            color="secondary" variant="contained">
                            Add
                        </Button>
                    </DialogActions>
                </div>
            </Dialog>
        </div>


    )
}

NewLesson.propTypes = {
    courseId: PropTypes.string.isRequired,
    addLesson: PropTypes.func.isRequired
}