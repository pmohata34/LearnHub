import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { Clock, Users, Star, BookOpen, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VideoPlayer } from "@/components/course/video-player";
import { QuizInterface } from "@/components/course/quiz-interface";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";

// Mock user ID - in a real app, this would come from authentication
const CURRENT_USER_ID = 1;

export default function CourseDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  
  const { data: course, isLoading } = useQuery({
    queryKey: ["/api/courses", id],
  });

  const { data: enrollment } = useQuery({
    queryKey: ["/api/users", CURRENT_USER_ID, "enrollments"],
    select: (data) => data?.find((e: any) => e.courseId === parseInt(id!))
  });

  if (isLoading) {
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
          <Link href="/browse">
            <Button>Browse Courses</Button>
          </Link>
        </div>
      </div>
    );
  }

  const handleEnroll = () => {
    // Redirect to checkout
    window.location.href = `/checkout?courseId=${course.id}`;
  };

  const handleQuizSubmit = (answers: number[]) => {
    toast({
      title: "Quiz Submitted",
      description: "Your answers have been recorded.",
    });
  };

  const isEnrolled = !!enrollment;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Course Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <div className="mb-4">
                <Badge variant="outline" className="mb-2">
                  {course.category}
                </Badge>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {course.title}
                </h1>
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-6">
                  {course.description}
                </p>
              </div>
              
              <div className="flex items-center space-x-6 mb-6">
                <div className="flex items-center">
                  <Users className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {course.instructor?.username || "Unknown Instructor"}
                  </span>
                </div>
                <div className="flex items-center">
                  <Clock className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {course.duration}
                  </span>
                </div>
                <div className="flex items-center">
                  <BookOpen className="h-5 w-5 text-gray-500 mr-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {course.level}
                  </span>
                </div>
              </div>
              
              <div className="flex items-center mb-6">
                <div className="flex text-yellow-400 mr-3">
                  {Array(5).fill(0).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-current" />
                  ))}
                </div>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  4.8 (1,234 reviews)
                </span>
              </div>
            </div>
            
            <div className="lg:w-80">
              <Card>
                <CardHeader>
                  <div className="aspect-video relative overflow-hidden rounded-lg">
                    <img
                      src={course.thumbnail || "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&w=400&h=240&fit=crop"}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-center mb-4">
                    <span className="text-3xl font-bold text-primary">
                      ${course.price}
                    </span>
                  </div>
                  
                  {isEnrolled ? (
                    <div className="space-y-3">
                      <div className="text-center">
                        <Badge variant="secondary" className="mb-2">
                          Enrolled
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          Progress: {enrollment.progress}%
                        </p>
                      </div>
                      <Button className="w-full" disabled>
                        Continue Learning
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      onClick={handleEnroll}
                      className="w-full bg-primary text-white hover:bg-primary/90"
                    >
                      Enroll Now
                    </Button>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Course Content */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="lessons">Lessons</TabsTrigger>
            <TabsTrigger value="quizzes">Quizzes</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Course Overview</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose dark:prose-invert max-w-none">
                  <p>{course.description}</p>
                  
                  <h3>What you'll learn:</h3>
                  <ul>
                    <li>Master the fundamentals of {course.title}</li>
                    <li>Build real-world projects</li>
                    <li>Learn industry best practices</li>
                    <li>Get certificate of completion</li>
                  </ul>
                  
                  <h3>Prerequisites:</h3>
                  <ul>
                    <li>Basic computer skills</li>
                    <li>No prior experience required</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="lessons" className="space-y-6">
            {isEnrolled ? (
              <div className="space-y-6">
                {course.lessons?.map((lesson: any) => (
                  <Card key={lesson.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{lesson.title}</span>
                        <Badge variant="outline">{lesson.duration}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {lesson.description}
                      </p>
                      {lesson.videoUrl && (
                        <VideoPlayer
                          videoUrl={lesson.videoUrl}
                          title={lesson.title}
                          onProgress={(progress) => {
                            console.log(`Video progress: ${progress}%`);
                          }}
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Enroll to Access Lessons
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Get access to all course lessons and materials.
                  </p>
                  <Button onClick={handleEnroll}>
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="quizzes" className="space-y-6">
            {isEnrolled ? (
              <div className="space-y-6">
                {course.quizzes?.map((quiz: any) => (
                  <Card key={quiz.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>{quiz.title}</span>
                        <Badge variant="outline">
                          {quiz.questions.length} Questions
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-400 mb-4">
                        {quiz.description}
                      </p>
                      <QuizInterface
                        quiz={quiz}
                        onSubmit={handleQuizSubmit}
                      />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="text-center py-12">
                  <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Enroll to Take Quizzes
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 mb-4">
                    Test your knowledge with interactive quizzes.
                  </p>
                  <Button onClick={handleEnroll}>
                    Enroll Now
                  </Button>
                </CardContent>
              </Card>
            )}
          </TabsContent>
          
          <TabsContent value="reviews" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Student Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {/* Sample reviews */}
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {Array(5).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        John D.
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Excellent course! The instructor explains complex concepts clearly and provides practical examples.
                    </p>
                  </div>
                  
                  <div className="border-b border-gray-200 dark:border-gray-700 pb-4">
                    <div className="flex items-center mb-2">
                      <div className="flex text-yellow-400 mr-2">
                        {Array(4).fill(0).map((_, i) => (
                          <Star key={i} className="h-4 w-4 fill-current" />
                        ))}
                        <Star className="h-4 w-4 text-gray-300" />
                      </div>
                      <span className="font-semibold text-gray-900 dark:text-gray-100">
                        Sarah M.
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400">
                      Great content and well-structured lessons. Would recommend to anyone starting out.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
