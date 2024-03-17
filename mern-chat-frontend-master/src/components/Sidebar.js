import React, { useContext, useEffect } from "react";
import { Col, ListGroup, Row } from "react-bootstrap";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../context/appContext";
import { addNotifications, resetNotifications } from "../features/userSlice";
import "./Sidebar.css";

function Sidebar() {
    const user = useSelector((state) => state.user);
    const dispatch = useDispatch();
    const { socket, setMembers, members, setCurrentRoom, setRooms, privateMemberMsg, rooms, setPrivateMemberMsg, currentRoom } = useContext(AppContext);

    useEffect(() => {
        if (user) {
            setCurrentRoom("Tech Talk");
            getRooms();
            socket.emit("join-room", "general");
            socket.emit("new-user");
        }
    }, [user]); // Added dependency on 'user' to trigger effect when user changes

    // Moved socket event listeners inside useEffect to ensure proper initialization
    useEffect(() => {
        socket.off("notifications").on("notifications", (room) => {
            if (currentRoom !== room) dispatch(addNotifications(room));
        });

        socket.off("new-user").on("new-user", (payload) => {
            setMembers(payload);
        });
    }, [currentRoom]); // Added dependency on 'currentRoom'

    function getRooms() {
        fetch("http://localhost:5001/rooms")
            .then((res) => res.json())
            .then((data) => setRooms(data))
            .catch((error) => console.error("Error fetching rooms:", error)); // Added error handling
    }

    function orderIds(id1, id2) {
        return id1 > id2 ? `${id1}-${id2}` : `${id2}-${id1}`; // Simplified orderIds function
    }

    function handlePrivateMemberMsg(member) {
        setPrivateMemberMsg(member);
        const roomId = orderIds(user._id, member._id);
        joinRoom(roomId, false);
    }

    function joinRoom(room, isPublic = true) {
        if (!user) {
            return alert("Please login");
        }
        socket.emit("join-room", room, currentRoom);
        setCurrentRoom(room);

        if (isPublic) {
            setPrivateMemberMsg(null);
        }
        dispatch(resetNotifications(room)); // Moved dispatch here for consistency
    }

    if (!user) {
        return null; // Changed empty fragment to null for simplicity
    }

    return (
        <>
            <h2>Available rooms</h2>
            <ListGroup>
                {rooms.map((room, idx) => (
                    <ListGroup.Item key={idx} onClick={() => joinRoom(room)} active={room === currentRoom} style={{ cursor: "pointer", display: "flex", justifyContent: "space-between" }}>
                        {room} {currentRoom !== room && <span className="badge rounded-pill bg-primary">{user.newMessages[room]}</span>}
                    </ListGroup.Item>
                ))}
            </ListGroup>
            <h2>Members</h2>
            {members.map((member) => (
                <ListGroup.Item key={member._id} style={{ cursor: "pointer" }} active={privateMemberMsg?._id === member._id} onClick={() => handlePrivateMemberMsg(member)} disabled={member._id === user._id}>
                    <Row>
                        <Col xs={2} className="member-status">
                            <img src={member.picture} className="member-status-img" alt="Member Avatar" /> {/* Added alt attribute */}
                            {member.status === "online" ? <i className="fas fa-circle sidebar-online-status"></i> : <i className="fas fa-circle sidebar-offline-status"></i>}
                        </Col>
                        <Col xs={9}>
                            {member.name}
                            {member._id === user._id && " (You)"}
                            {member.status === "" && ""}
                        </Col>
                        <Col xs={1}>
                            <span className="badge rounded-pill bg-primary">{user.newMessages[orderIds(member._id, user._id)]}</span>
                        </Col>
                    </Row>
                </ListGroup.Item>
            ))}
        </>
    );
}

export default Sidebar;
