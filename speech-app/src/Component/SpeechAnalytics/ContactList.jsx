import React, { useState } from 'react';
import { Table, TableHead, TableBody, TableRow, TableCell, TableContainer, Paper, TableSortLabel, Avatar, Tabs, Tab, Box, TextField, InputAdornment, IconButton } from '@material-ui/core';
import PhoneIcon from '@material-ui/icons/Phone';
import EmailIcon from '@material-ui/icons/Email';
import MessageIcon from '@material-ui/icons/Message';
import { Dialpad, Keyboard, PhoneOutlined } from '@material-ui/icons';
import DialPad from './DialPad';

const contacts = [
    {
        id: 1,
        avatar: 'avatar1.jpg',
        name: 'John Doe',
        phoneNumber: '123-456-7890',
    },
    {
        id: 2,
        avatar: 'avatar2.jpg',
        name: 'Jane Smith',
        phoneNumber: '987-654-3210',
    },
    {
        id: 3,
        avatar: 'avatar1.jpg',
        name: 'John Doe',
        phoneNumber: '123-456-7890',
    },
    {
        id: 4,
        avatar: 'avatar2.jpg',
        name: 'Jane Smith',
        phoneNumber: '987-654-3210',
    },
    {
        id: 5,
        avatar: 'avatar1.jpg',
        name: 'John Doe',
        phoneNumber: '123-456-7890',
    },
    {
        id: 6,
        avatar: 'avatar2.jpg',
        name: 'Jane Smith',
        phoneNumber: '987-654-3210',
    },
    // Add more contact data here
];

const recentContacts = [
    {
        id: 3,
        avatar: 'avatar3.jpg',
        name: 'Alice Johnson',
        phoneNumber: '555-123-4567',
    },
    {
        id: 4,
        avatar: 'avatar4.jpg',
        name: 'Bob Brown',
        phoneNumber: '888-777-9999',
    },
    // Add more recent contact data here
];

const ContactList = () => {
    const [sortedColumn, setSortedColumn] = useState(null);
    const [isAscending, setIsAscending] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [showKeypad, setShowKeypad] = useState(false);

    const handleSort = (column) => {
        if (column === sortedColumn) {
            setIsAscending(!isAscending);
        } else {
            setSortedColumn(column);
            setIsAscending(true);
        }
    };

    const filteredContacts = activeTab === 0 ? contacts : recentContacts;

    const sortedContacts = [...filteredContacts];
    if (sortedColumn) {
        sortedContacts.sort((a, b) => {
            const aValue = a[sortedColumn];
            const bValue = b[sortedColumn];
            return (isAscending ? 1 : -1) * (aValue < bValue ? -1 : 1);
        });
    }

    return (
        <div style={{ height: "92vh", boxShadow: "1px 3px 7px #464343",display:"flex",flexDirection:"column",justifyContent:"center" }}>
            <Box style={{ margin:"18px"}}>
            {!showKeypad ? (
                    <>
                <TextField
                    placeholder="XXX-XXX-XXX"
                    variant='outlined'
                    style={{ background: "white", marginTop: "10px" }}
                    size='small'
                    fullWidth
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <PhoneIcon style={{ background: "green", color: "white" }} />
                            </InputAdornment>
                        ),
                    }}
                />
                
                <Tabs
                    value={activeTab}
                    indicatorColor="primary"
                    textColor="primary"
                    onChange={(e, newValue) => setActiveTab(newValue)}
                >
                    <Tab label="Contacts" />
                    <Tab label="Recent" />
                </Tabs>
                <div style={{ height: '500px', overflowY: 'auto' }}>
                <TableContainer component={Paper}>
                    <Table className="contact-list">
                        <TableHead>
                            <TableRow>
                                {/* Add TableSortLabel as needed */}
                                <TableCell>Name</TableCell>
                                <TableCell>Phone Number</TableCell>
                                <TableCell>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {sortedContacts.map((contact) => (
                                <TableRow key={contact.id} className="contact-item">
                                    <TableCell className="name">
                                        <Box style={{ display: "flex", alignItems: "center" }}>
                                            <Avatar src={contact.avatar} alt={contact.name} style={{ marginRight: "5px" }} />
                                            {contact.name}
                                        </Box>
                                    </TableCell>
                                    <TableCell className="phone">{contact.phoneNumber}</TableCell>
                                    <TableCell className="actions">
                                        <PhoneOutlined />
                                        <EmailIcon className="message-button" />
                                        <MessageIcon className="email-button" />
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </TableContainer>
                </div>
                </>
                ) : (
                    // Render your keypad component here
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', fontSize: '24px', fontWeight: 'bold' }}>
                       <DialPad/>
                    </div>
                )}
                <Box style={{display:"flex",justifyContent:"center",marginTop:"5px"}}>
                <IconButton style={{border:"2px solid #c8bfbf",boxShadow: "1px 3px 7px #464343",borderRadius:"10px"}} onClick={() => setShowKeypad(!showKeypad)}>
                    <Dialpad />
                </IconButton>
                </Box>
            </Box>
        </div>
    );
};

export default ContactList;
