import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Lock, Star } from 'lucide-react';

export function UpgradeCTA({ title = 'Recurso exclusivo Premium', description = 'Assine o plano Premium para desbloquear este recurso.', showPlansLink = true }) {
  return (
    <Card className="border-primary/50 bg-primary/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock className="h-5 w-5 text-primary" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {showPlansLink && (
          <Button asChild>
            <Link to="/planos" className="inline-flex items-center gap-2">
              <Star className="h-4 w-4" />
              Ver planos Premium
            </Link>
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
