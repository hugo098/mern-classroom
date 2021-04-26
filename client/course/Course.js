import { Avatar, Button, Card, CardHeader, CardMedia, Dialog, DialogActions, DialogContent, DialogTitle, Divider, IconButton, List, ListItem, ListItemAvatar, ListItemText, makeStyles, Typography } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import auth from '../auth/auth-helper'
import { read, update } from './api-course'
import NewLesson from './NewLesson'
import { Link, Redirect } from 'react-router-dom'
import DeleteCourse from './DeleteCourse'

const useStyles = makeStyles(theme => ({
    root: theme.mixins.gutters({
        maxWidth: 800,
        margin: 'auto',
        padding: theme.spacing(3),
        marginTop: theme.spacing(12)
    }),
    flex: {
        display: 'flex',
        marginBottom: 20
    },
    card: {
        padding: '24px 40px 40px'
    },
    subheading: {
        margin: '10px',
        color: theme.palette.openTitle
    },
    details: {
        margin: '16px',
    },
    sub: {
        display: 'block',
        margin: '3px 0px 5px 0px',
        fontSize: '0.9em',

    },
    media: {
        height: 190,
        display: 'inline-block',
        width: '100%',
        marginLeft: '16px'
    },
    icon: {
        verticalAlign: 'sub'
    },
    category: {
        color: '#5c5c5c',
        fontSize: '0.9em',
        padding: '3px 5px',
        backgroundColor: '#dbdbdb',
        borderRadius: '0.2em',
        marginTop: 5
    },
    action: {
        margin: '10px 0px',
        display: 'flex',
        justifyContent: 'flex-end'
    },
    statSpan: {
        margin: '7px 10px 0 10px',
        alignItems: 'center',
        color: '#616161',
        display: 'inline-flex',
        '& svg': {
            marginRight: 10,
            color: '#b6ab9a'
        }
    },
    enroll: {
        float: 'right'
    }
}))

export default function Course({ match }) {
    const classes = useStyles()
    const [stats, setStats] = useState({})
    const [course, setCourse] = useState({ instructor: {} })
    const [values, setValues] = useState({
        redirect: false,
        error: ''
    })
    const [open, setOpen] = useState(false)
    const jwt = auth.isAuthenticated()
    useEffect(() => {
        const abortController = new AbortController()
        const signal = abortController.signal

        read({ courseId: match.params.courseId }, signal).then((data) => {
            if (data.error) {
                setValues({ ...values, error: data.error })
            } else {
                setCourse(data)
            }
        })
        return function cleanup() {
            abortController.abort()
        }
    }, [match.params.courseId])

    if (values.redirect) {
        return (<Redirect to={'/teach/courses'} />)
    }

    const imageUrl = course._id
        ? `/api/courses/photo/${course._id}?${new Date().getTime()}`
        : '/api/courses/defaultphoto'

    const addLesson = (course) => {
        setCourse(course)
    }

    const removeCourse = (course) => {
        setValues({ ...values, redirect: true })
    }

    const clickPublish = () => {
        if (course.lessons.length > 0) {
            setOpen(true)
        }
    }

    const handleClose = () => {
        setOpen(false)
    }

    const publish = () => {
        let courseData = new FormData()
        courseData.append('published', true)
        update({
            courseId: match.params.courseId
        }, {
            t: jwt.token
        }, courseData).then((data) => {
            if (data && data.error) {
                setValues({ ...values, error: data.error })
            } else {
                setCourse({ ...course, published: true })
                setOpen(false)
            }
        })
    }

    return (
        <div className={classes.root}>
            <Card className={classes.card}>
                <CardHeader
                    title={course.name}
                    subheader={<div>
                        <Link to={"/user/" + course.instructor._id} className={classes.sub} >
                            By {course.instructor.name}
                        </Link>
                        <span className={classes.category}>{course.category}</span>
                    </div>
                    }
                    action={auth.isAuthenticated().user && auth.isAuthenticated().user._id ==
                        course.instructor._id &&
                        (<span><Link to={"/teach/course/edit/" + course._id}>
                            <IconButton aria-label="Edit" color="secondary">
                                <Edit />
                            </IconButton>
                        </Link>
                            {!course.published ? (<>
                                <Button color="secondary" variant="outlined"
                                    onClick={clickPublish}>
                                    {course.lessons.length == 0 ?
                                        "Add atleast 1 lesson to publish"
                                        : "Publish"}
                                </Button>
                                <DeleteCourse course={course} onRemove={removeCourse} />
                            </>) : (
                                    <Button color="primary" variant="outlined">Published</Button>
                                )}
                        </span>)
                    }
                />
                <div className={classes.flex}>
                    <CardMedia className={classes.media} image={imageUrl} title={course.name} />
                    <div className={classes.details}>
                        <Typography variant="body1" className={classes.subheading}>
                            {course.description}<br />
                        </Typography>
                    </div>
                </div>
                <Divider />
                <CardHeader
                    title={<Typography variant="h6" className={classes.subheading}>Lessons</Typography>
                    }
                    subheader={<Typography variant="body1" className={classes.subheading}>{course.lessons && course.lessons.length} lessons</Typography>}
                    action={
                        auth.isAuthenticated().user && auth.isAuthenticated().user._id == course.instructor._id && !course.published &&
                        (<span className={classes.action}>
                            <NewLesson courseId={course._id} addLesson={addLesson} />
                        </span>)
                    }
                />
                <List>
                    {course.lessons && course.lessons.map((lesson, index) => {
                        return (<span key={index}>
                            <ListItem>
                                <ListItemAvatar>
                                    <Avatar>
                                        {index + 1}
                                    </Avatar>
                                </ListItemAvatar>
                                <ListItemText
                                    primary={lesson.title}
                                />
                            </ListItem>
                            <Divider variant="inset" component="li" />
                        </span>)
                    }
                    )}
                </List>
            </Card>
            <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">Publish Course</DialogTitle>
                <DialogContent>
                    <Typography variant="body1">Publishing your course will make it live to students for enrollment. </Typography><Typography variant="body1">Make sure all lessons are added and ready for publishing.</Typography></DialogContent>
                <DialogActions>
                    <Button onClick={handleClose} color="primary" variant="contained">
                        Cancel
                </Button>
                    <Button onClick={publish} color="secondary" variant="contained">
                        Publish
                </Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}