import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardBody, Spinner, Button } from "@nextui-org/react";
import { ticketsService } from "../services/ticket.service";
import DefaultLayout from "../layouts/default";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState(null);
  const [ticket, setTicket] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      try {
        const sessionId = searchParams.get("session_id");
        if (!sessionId) {
          throw new Error("No session ID provided");
        }

        const ticketData = await ticketsService.confirmPayment(sessionId);
        setTicket(ticketData);

        const timer = setTimeout(() => {
          navigate("/profile");
        }, 5000);

        return () => clearTimeout(timer);
      } catch (err) {
        console.error("Payment confirmation error:", err);
        setError(err.response?.data?.message || "Failed to confirm payment");
      } finally {
        setIsProcessing(false);
      }
    };

    confirmPayment();
  }, [searchParams, navigate]);

  return (
    <DefaultLayout>
      <div className="max-w-lg mx-auto mt-10">
        <Card>
          <CardBody>
            <div className="flex flex-col items-center p-6">
              {isProcessing ? (
                <>
                  <Spinner size="lg" color="primary" />
                  <p className="mt-6 text-xl font-medium">
                    Processing your payment...
                  </p>
                  <p className="text-gray-500 mt-2">Please wait</p>
                </>
              ) : error ? (
                <>
                  <h2 className="text-2xl font-bold text-danger mt-6">
                    Payment Failed
                  </h2>
                  <p className="text-gray-600 mt-2 text-center">{error}</p>
                  <div className="mt-8">
                    <Button
                      color="primary"
                      onPress={() =>
                        navigate(`/event/${searchParams.get("eventId")}`)
                      }
                    >
                      Back to Event
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-success mt-6">
                    Payment Successful!
                  </h2>
                  <p className="text-gray-600 mt-2 text-center">
                    Your ticket has been confirmed and sent to your email.
                  </p>
                  <div className="w-full mt-8">
                    <p className="text-sm text-center text-gray-500">
                      Redirecting to your tickets in a few seconds...
                    </p>
                    <div className="flex justify-center mt-4 gap-4">
                      <Button
                        color="primary"
                        variant="ghost"
                        onPress={() => navigate("/")}
                      >
                        Go Home
                      </Button>
                      <Button
                        color="primary"
                        onPress={() => navigate("/profile")}
                      >
                        View My Tickets
                      </Button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardBody>
        </Card>
      </div>
    </DefaultLayout>
  );
}
