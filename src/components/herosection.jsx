import { MoveRight, Play } from 'lucide-react';
import { Button } from './ui/button';
import {
 Avatar,
 AvatarFallback,
 AvatarGroup,
 AvatarGroupCount,
 AvatarImage,
} from "@/components/ui/avatar"

const HeroSection = () => {
 return (<>
  <div>
   <div className="left-part">
    <span> <span>*</span>3,200+ builders online</span>
    <div className="heading">
     <h1>Find the Builder <br />who <span>Completes <br />your stack</span></h1>
    </div>
    <div className="about">
     <p>SkillMatch pairs developers using AI - matching by what you have and what you need, so you stop searching and start building</p>
    </div>
    <div className="button-group">
     <Button>Start matching free <MoveRight /></Button>
     <Button>Preview DashBoard <Play /></Button>
    </div>
    <div className="builders">
     <AvatarGroup className="grayscale">
      <Avatar>
       <AvatarImage src="https://github.com/shadcn.png" alt="@shadcn" />
       <AvatarFallback>CN</AvatarFallback>
      </Avatar>
      <Avatar>
       <AvatarImage src="https://github.com/maxleiter.png" alt="@maxleiter" />
       <AvatarFallback>LR</AvatarFallback>
      </Avatar>
      <Avatar>
       <AvatarImage
        src="https://github.com/evilrabbit.png"
        alt="@evilrabbit"
       />
       <AvatarFallback>ER</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
     </AvatarGroup>
    </div>
   </div>
   <div className="right-part">
    <div className="top_match_of_the_day">
     <div className="match_heading">
      <p>TOP MATCH TODAY</p>
      <h3>94%</h3>
     </div>
     <div className="profile">
      <div className="profile_holder">
       <Avatar>
        <AvatarImage
         src="https://github.com/shadcn.png"
         alt="@shadcn"
         className="grayscale"
        />
        <AvatarFallback>CN</AvatarFallback>
       </Avatar>
       <div className="user_name border-b-4">
        <p>alex smith</p>
        <p>software developer</p>
       </div>
       <p>Building SaaS tools. Needs UI/UX help, and you have exactly that.</p>
       <div className="skillshave">
        <div className="skill">
         react
        </div>
        <div className="skill">
         react
        </div>
        <div className="skill">
         react
        </div>
       </div>
       <div className="skills_needs">
        <div className="skills_needed">
          <p>UI/UX</p>
        </div>
         <div className="skills_needed">
          <p>Figma</p>
        </div>
       </div>
       <div className="ai_match">
        <p> AI MATCH INSIGHT</p>
        <p>Your React skills fill Aanya's frontend gap. Her backend depth covers your weakness. Rare two-way match.</p>
       </div>
        <Button>Connect <MoveRight/></Button>
      </div>
     </div>
    </div>
   </div>
  </div>
 </>);
}

export default HeroSection;