import React from 'react';
import { Box, Typography, Stack } from '@mui/material';
import PersonIcon from '@mui/icons-material/Person';
import BookIcon from '@mui/icons-material/Book';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import NumbersIcon from '@mui/icons-material/Numbers';
import HourglassEmptyIcon from '@mui/icons-material/HourglassEmpty';
import { Event } from '../store/globalStore';

interface ActivitySummaryProps {
    events: Event[];
}

const ActivitySummary: React.FC<ActivitySummaryProps> = ({ events }) => {
    const renderIcon = (type: string) => {
        switch (type) {
            case 'Resource':
                return <PersonIcon />;
            case 'Categorical':
                return <BookIcon />;
            case 'Time':
            case 'Duration':
                return <AccessTimeIcon />;
            case 'Numerical':
                return <NumbersIcon />;
            default:
                return null;
        }
    };

    const renderInputFields = (event: Event) => {
        switch (event.type) {
            case 'Resource':
            case 'Categorical':
            case 'Numerical':
                return (
                    <>
                        <Typography variant="body2" component="span">Name: {event.name}</Typography>
                        <Typography variant="body2" component="span">Value: {event.value}</Typography>
                        <Typography variant="body2" component="span">Probability: {event.probability}%</Typography>
                    </>
                );
            case 'Time':
            case 'Duration':
                return (
                    <>
                        <Typography variant="body2" component="span">Name: {event.name}</Typography>
                        <Typography variant="body2" component="span">Days: {event.days}</Typography>
                        <Typography variant="body2" component="span">Hours: {event.hours}</Typography>
                        <Typography variant="body2" component="span">Minutes: {event.minutes}</Typography>
                        <Typography variant="body2" component="span">Seconds: {event.seconds}</Typography>
                        <Typography variant="body2" component="span">Probability: {event.probability}%</Typography>
                    </>
                );
            default:
                return null;
        }
    };

    const groupedEvents = events.reduce((acc: Record<string, Event[]>, event) => {
        if (!acc[event.activity]) {
            acc[event.activity] = [];
        }
        acc[event.activity].push(event);
        return acc;
    }, {});

    return (
        <Box>
            {Object.keys(groupedEvents).map((activity, index) => (
                <Box key={index} mb={3} p={3} border={1} borderRadius={4}>
                    <Typography variant="h6">{activity}</Typography>
                    {groupedEvents[activity].map((event, idx) => (
                        <Box key={idx} display="flex" alignItems="center" mb={1} mt={2}>
                            {renderIcon(event.type)}
                            <Typography variant="subtitle1" ml={1} mr={2}>{event.type}</Typography>
                            <Stack direction="row" spacing={2}>
                                {renderInputFields(event)}
                            </Stack>
                        </Box>
                    ))}
                </Box>
            ))}
        </Box>
    );
};

export default ActivitySummary;
