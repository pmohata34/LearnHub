import { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/context/authContext";

interface Course {
  id: number;
  title: string;
  description: string;
  price: number;
  category: string;
}

interface RazorpayResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const Checkout = () => {
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const { user } = useAuth();
  const navigate = useNavigate();

  const courseId = searchParams.get("courseId");

  useEffect(() => {
    if (!courseId || isNaN(Number(courseId))) {
      toast({
        title: "Invalid course ID",
        description: "Please check the link and try again.",
        variant: "destructive",
      });
      return;
    }

    apiRequest("GET", `/api/courses/${courseId}`)
      .then(async (res: Response) => {
        const result = await res.json();
        setCourse(result);
      })
      .catch(() => {
        toast({
          title: "Course not found",
          description: "The course could not be retrieved.",
          variant: "destructive",
        });
      });
  }, [courseId]);

  const handlePayment = async () => {
    if (!user || !courseId) {
      toast({
        title: "Authentication Required",
        description: "Please login to continue.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const res = await apiRequest("POST", "/api/create-order", {
        amount: course?.price,
        currency: "INR",
      });

      const data = await res.json();

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID!,
        amount: data.amount,
        currency: data.currency,
        name: "LearnHub",
        description: course?.title,
        order_id: data.orderId,
        handler: async (response: RazorpayResponse) => {
          try {
            await apiRequest("POST", "/api/verify-payment", {
              ...response,
              userId: user.id,
              courseId: course?.id,
            });

            toast({
              title: "Payment successful",
              description: `You have been enrolled in ${course?.title}.`,
            });

            navigate("/my-courses");
          } catch {
            toast({
              title: "Payment verification failed",
              description: "Please contact support.",
              variant: "destructive",
            });
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: { color: "#6366f1" },
      };

      new (window as any).Razorpay(options).open();
    } catch {
      toast({
        title: "Error initiating payment",
        description: "Something went wrong while creating Razorpay order.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!course) return null;

  return (
    <div className="max-w-2xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>{course.title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">{course.description}</p>
          <Badge variant="secondary">{course.category}</Badge>
          <p className="text-xl font-semibold">₹{course.price}</p>
          <Button className="w-full" onClick={handlePayment} disabled={loading}>
            {loading ? "Processing..." : "Pay with Razorpay"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Checkout;
