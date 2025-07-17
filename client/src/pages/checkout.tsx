import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = import.meta.env.VITE_STRIPE_PUBLIC_KEY 
  ? loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY) 
  : null;

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 1;

const CheckoutForm = ({ course }: { course: any }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    if (!stripe || !elements) {
      setIsProcessing(false);
      return;
    }

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/courses/${course.id}`,
      },
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Payment Successful",
        description: "Thank you for your purchase!",
      });
    }

    setIsProcessing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Complete Your Purchase</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  By {course.instructor?.username || "Unknown Instructor"}
                </p>
                <div className="flex items-center mt-2">
                  <Badge variant="outline" className="mr-2">
                    {course.level}
                  </Badge>
                  <Badge variant="outline">
                    {course.category}
                  </Badge>
                </div>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-primary">
                  ${course.price}
                </span>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
            <PaymentElement />
          </div>

          <Button
            type="submit"
            disabled={!stripe || isProcessing}
            className="w-full bg-primary text-white hover:bg-primary/90"
          >
            {isProcessing ? "Processing..." : `Pay $${course.price}`}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState("");
  const { toast } = useToast();
  
  // Get course ID from URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const courseId = urlParams.get('courseId');

  const { data: course, isLoading: courseLoading } = useQuery({
    queryKey: ["/api/courses", courseId],
    enabled: !!courseId,
  });

  useEffect(() => {
    if (course && courseId) {
      // Create PaymentIntent as soon as the page loads
      apiRequest("POST", "/api/create-payment-intent", {
        courseId: parseInt(courseId),
        userId: CURRENT_USER_ID,
      })
        .then((res) => res.json())
        .then((data) => {
          setClientSecret(data.clientSecret);
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message || "Failed to initialize payment",
            variant: "destructive",
          });
        });
    }
  }, [course, courseId, toast]);

  if (courseLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">
            Course Not Found
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            The course you're trying to purchase could not be found.
          </p>
        </div>
      </div>
    );
  }

  // If Stripe is not configured, show setup message
  if (!stripePromise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="text-6xl mb-4">⚙️</div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Stripe Configuration Required
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              To process payments, you'll need to configure your Stripe API keys.
            </p>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 text-left max-w-md mx-auto">
              <p className="font-medium text-blue-900 dark:text-blue-100 mb-3">Setup Instructions:</p>
              <ol className="text-blue-800 dark:text-blue-200 space-y-2 text-sm">
                <li>1. Create a Stripe account at stripe.com</li>
                <li>2. Get your API keys from the Stripe Dashboard</li>
                <li>3. Add VITE_STRIPE_PUBLIC_KEY to your environment</li>
                <li>4. Add STRIPE_SECRET_KEY to your environment</li>
                <li>5. Restart the application</li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!clientSecret) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
          <p className="text-gray-600 dark:text-gray-400">
            Initializing payment...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">
            Checkout
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Complete your purchase to get instant access to the course
          </p>
        </div>

        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm course={course} />
        </Elements>
      </div>
    </div>
  );
}
