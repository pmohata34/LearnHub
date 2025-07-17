import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CourseCreationForm } from "@/components/course/course-creation-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Mock instructor ID - in a real app, this would come from authentication
const CURRENT_INSTRUCTOR_ID = 2;

export default function CreateCourse() {
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const createCourseMutation = useMutation({
    mutationFn: async (courseData: any) => {
      const response = await apiRequest("POST", "/api/courses", {
        ...courseData,
        instructorId: CURRENT_INSTRUCTOR_ID,
        isPublished: false,
      });
      return response.json();
    },
    onSuccess: (course) => {
      toast({
        title: "Course Created",
        description: `"${course.title}" has been created successfully.`,
      });
      
      // Invalidate courses cache
      queryClient.invalidateQueries({ queryKey: ["/api/courses"] });
      
      // Redirect to course detail page
      setLocation(`/courses/${course.id}`);
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create course",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (data: any) => {
    createCourseMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">
            Create New Course
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Share your knowledge with students around the world
          </p>
        </div>
        
        <CourseCreationForm
          onSubmit={handleSubmit}
          isLoading={createCourseMutation.isPending}
        />
      </div>
    </div>
  );
}
