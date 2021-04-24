import { Card, CardHeader, CardMedia, IconButton, Link, makeStyles, Typography } from '@material-ui/core'
import { Edit } from '@material-ui/icons'
import React, { useEffect, useState } from 'react'
import auth from '../auth/auth-helper'
import { read } from './api-course'


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
        fontSize: '0.9em'
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

    return (
        <div className={classes.root}>
            <Card className={classes.card}>
                <CardHeader
                    title={course.name}
                    subheader={<div>
                        <Link to={"/user/" + course.instructor._id}>
                            By {course.instructor.name}
                        </Link>
                        <span>{course.category}</span>
                    </div>
                    }
                    action={auth.isAuthenticated().user && auth.isAuthenticated().user._id ==
                        course.instructor._id &&
                        (<span><Link to={"/teach/course/edit/" + course._id}>
                            <IconButton aria-label="Edit" color="secondary">
                                <Edit />
                            </IconButton>
                        </Link>
                        </span>)
                    }
                />
                <CardMedia className={classes.media} image={imageUrl} title={course.name} />
                <div>
                    <Typography variant="body1">
                        {course.description}
                    </Typography>
                </div>

            </Card>
        </div>
    )
}