import React, { useState } from "react";
import { Row, Col, Button, Spinner } from "react-bootstrap";
import { LinkContainer } from "react-router-bootstrap";
import "./Home.css";

function Home() {
    const [isLoading, setIsLoading] = useState(false);

    const handleClick = () => {
        setIsLoading(true);
        // Simulating a delay for demonstration purposes
        setTimeout(() => {
            setIsLoading(false);
        }, 2000);
    };

    return (
        <Row>
            <Col md={6} className="d-flex flex-direction-column align-items-center justify-content-center">
                <div>
                    <h1>Embark on adventures, share them with friends</h1>
                    <p>Connect globally, Talkie bridges friendships worldwide.</p>
                    <LinkContainer to="/chat">
                        <Button
                            variant="success"
                            className="home-connect-btn"
                            onClick={handleClick}
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <Spinner animation="border" size="sm" role="status" aria-hidden="true" />
                                    <span className="sr-only">Loading...</span>
                                </>
                            ) : (
                                <>
                                    Connect <i className="fas fa-comments home-message-icon" />
                                </>
                            )}
                        </Button>
                    </LinkContainer>
                </div>
            </Col>
            <Col md={6} className="home__bg"></Col>
        </Row>
    );
}

export default Home;
