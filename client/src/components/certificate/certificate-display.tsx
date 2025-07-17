import { Download, Share2, Award } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface CertificateDisplayProps {
  certificates: Array<{
    id: number;
    course: {
      title: string;
      instructor?: { username: string };
    };
    issuedAt: Date;
    certificateUrl?: string;
  }>;
}

export function CertificateDisplay({ certificates }: CertificateDisplayProps) {
  const handleDownload = (certificateId: number) => {
    // In a real app, this would download the certificate PDF
    console.log(`Downloading certificate ${certificateId}`);
  };

  const handleShare = (certificateId: number) => {
    // In a real app, this would share the certificate
    console.log(`Sharing certificate ${certificateId}`);
  };

  if (certificates.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <Award className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-600 dark:text-gray-400">
            Complete courses to earn certificates and showcase your achievements.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
        Your Certificates
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {certificates.map((certificate) => (
          <Card
            key={certificate.id}
            className="border-2 border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/20 dark:to-amber-800/20"
          >
            <CardContent className="p-6">
              <div className="text-center mb-4">
                <div className="w-full h-40 bg-white dark:bg-gray-800 rounded-lg mb-4 flex items-center justify-center border-2 border-amber-300 dark:border-amber-700">
                  <div className="text-center">
                    <Award className="w-16 h-16 mx-auto mb-4 text-amber-500" />
                    <h4 className="font-bold text-gray-900 dark:text-gray-100 text-lg">
                      Certificate of Completion
                    </h4>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <h5 className="font-semibold text-gray-900 dark:text-gray-100">
                    {certificate.course.title}
                  </h5>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Instructor: {certificate.course.instructor?.username || "Unknown"}
                  </p>
                  <Badge variant="outline" className="border-amber-400 text-amber-700 dark:text-amber-300">
                    Completed on {new Date(certificate.issuedAt).toLocaleDateString()}
                  </Badge>
                </div>
              </div>
              
              <div className="flex items-center justify-between pt-4 border-t border-amber-200 dark:border-amber-700">
                <Button
                  onClick={() => handleDownload(certificate.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Download</span>
                </Button>
                
                <Button
                  onClick={() => handleShare(certificate.id)}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Share2 className="h-4 w-4" />
                  <span>Share</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
