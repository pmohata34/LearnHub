import { useQuery } from "@tanstack/react-query";
import { Book, TrendingUp, Award, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { CourseCard } from "@/components/course/course-card";
import { CertificateDisplay } from "@/components/certificate/certificate-display";
import { Link } from "wouter";

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 1;

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "stats"],
  });

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "enrollments"],
  });

  const { data: certificates, isLoading: certificatesLoading } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "certificates"],
  });

  const { data: recommendedCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["/api/courses"],
  });

  if (statsLoading || enrollmentsLoading || certificatesLoading || coursesLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const currentEnrollments = enrollments?.filter((e: any) => e.progress < 100) || [];
  const recentCourses = recommendedCourses?.slice(0, 3) || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-display">
              My Learning Dashboard
            </h1>
            <Link href="/create-course">
              <Button className="bg-primary text-white hover:bg-primary/90">
                Create New Course
              </Button>
            </Link>
          </div>
          
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-primary/10 rounded-lg">
                    <Book className="h-6 w-6 text-primary" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Enrolled Courses</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.enrolledCourses || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.completionRate || 0}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
                    <Award className="h-6 w-6 text-amber-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Certificates</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.certificates || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center">
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Hours Learned</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {stats?.hoursLearned || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Continue Learning */}
        {currentEnrollments.length > 0 && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Continue Learning</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentEnrollments.map((enrollment: any) => (
                  <div key={enrollment.id} className="flex items-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <img
                      src={enrollment.course?.thumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&w=100&h=80&fit=crop"}
                      alt={enrollment.course?.title}
                      className="w-20 h-16 rounded-lg object-cover"
                    />
                    <div className="flex-1 ml-4">
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {enrollment.course?.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        By {enrollment.course?.instructor?.username || "Unknown"}
                      </p>
                      <div className="flex items-center mt-2">
                        <div className="flex-1 mr-4">
                          <Progress value={enrollment.progress} className="h-2" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {enrollment.progress}% Complete
                        </span>
                      </div>
                    </div>
                    <Link href={`/courses/${enrollment.course?.id}`}>
                      <Button className="bg-primary text-white hover:bg-primary/90">
                        Continue
                      </Button>
                    </Link>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Recommended Courses */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Recommended for You
            </h2>
            <Link href="/browse">
              <Button variant="outline">View All Courses</Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentCourses.map((course: any) => (
              <CourseCard
                key={course.id}
                course={course}
                onEnroll={(courseId) => {
                  // Handle enrollment - would redirect to checkout
                  console.log(`Enrolling in course ${courseId}`);
                }}
              />
            ))}
          </div>
        </div>

        {/* Certificates */}
        <CertificateDisplay certificates={certificates || []} />
      </main>
    </div>
  );
}
