<?php

namespace AppBundle\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class TutorialRoomController extends Controller
{
    /**
     * @Route("/tutorials/rooms/{roomToken}", name="tutorial_room", requirements={"roomToken": ".{1,100}"})
     */
    public function roomTokenAction($roomToken)
    {
        $em = $this->getDoctrine()->getManager('user_conn');
        $room = $em->getRepository('AppBundle:TutorialRoomTable')->findOneBy(array('accessToken' => $roomToken));

        $user = $this->get('security.token_storage')->getToken()->getUser();

        $uid = $user->getUserId();

        if(!$user)
        {
            //Big error in authentication, throw error
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'A problem has occured.'));
        }

        if(!$room)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Room does not exist.'));
        }

        $roomServer = $room->getServer();
        $roomPart = $em->getRepository('AppBundle:RoomParticipants')->findOneBy(array('roomId' => $room->getRoomId(), 'user' => $uid));

        if(!$roomPart)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'You are not permitted to this room.'));
        }

        $currTime = new \DateTime("now");

        //Check room times
        if($room->getExpiry() < $currTime)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Session has expired.'));
        }

        if($room->getStartTime())
        {
            if($room->getStartTime()->add(new \DateInterval('PT'.$room->getSessionLength().'S')) < $currTime)
            {
                return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Session has ended.'));
            }
        }

        $waitJ = $user->getWaitingJoin();

        if(!$waitJ)
        {
            $waitJ = new \AppBundle\Entity\JoinWait();
            $waitJ->setUser($user);
            $waitJ->setRoomId($room);
            $waitJ->setJoinTime(new \DateTime("now"));
            $em->persist($waitJ);
        }
        elseif($waitJ->getRoomId()->getRoomId() == $room->getRoomId())
        {
            $waitJ->setJoinTime(new \DateTime("now"));
        }
        else
        {
            $currTime = new \DateTime("now");
            $currTime->sub(new DateInterval('PT1M'));

            if($currTime < $waitJ->getJoinTime())
            {
                return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'You are attempting to join another room.'));
            }

            $waitJ->setUser($user);
            $waitJ->setRoomId($room);
            $waitJ->setJoinTime(new DateTime("now"));
        }

        if(!$room->getHostJoin())
        {
            //Use a wait that does not reload the page
            $em->flush();
            return $this->render('tutorial/room-reload.html.twig', array('errorInfo' => 'Host has not joined yet.'));
        }

        if(!$room->getStartTime())
        {
            //Use a wait that does not reload the page
            $em->flush();
            return $this->render('tutorial/room-reload.html.twig', array('errorInfo' => 'Host has not started session yet.'));
        }

        if(!$roomServer)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Server not assigned.'));
        }

        $serverToken = $roomServer->getEndPoint();

        $roomPart->setJoinTime(new \DateTime("now"));

        $em->remove($waitJ);
        $em->flush();

        $session = $this->get('session');
        $sessId = $session->getId();
        return $this->render('tutorial/room.html.twig', array('roomToken' => $roomToken, 'serverToken' => $serverToken, 'sessionId' => $sessId, 'isHost' => false));
    }

    /**
     * @Route("/tutorials/tutor/rooms/{roomToken}/wait/getwaitlist", name="tutorial_room_waitlist", requirements={"roomToken": ".{1,100}"})
     */
    public function roomGetWaitAction($roomToken)
    {
        $em = $this->getDoctrine()->getManager('user_conn');
        $user = $this->get('security.token_storage')->getToken()->getUser();
        $room = $em->getRepository('AppBundle:TutorialRoomTable')->findOneBy(array('accessToken' => $roomToken));
        $response = array();

        if(!$user)
        {
            return new Response(json_encode($response));
        }

        if(!$room)
        {
            return new Response(json_encode($response));
        }


        $tuteSess = $em->getRepository('AppBundle:TutorSession')->findOneBy(array('sessId' => $room->getRoomId()));
        $tutor = $tuteSess->getTutorId();

        if($user->getUserId() != $tutor->getUserId())
        {
            return new Response(json_encode($response));
        }

        $waitList = $room->getWaitingJoins();


        if($waitList->isEmpty())
        {
            return new Response(json_encode($response));
        }

        $useList = array();

        $userItem = array("id" => $waitList->first()->getUser()->getUserId(), "username" => $waitList->first()->getUser()->getUsername());
        array_push($useList, $userItem);

        for($i = 1; $i < $waitList->count(); $i++)
        {
            $waitList->next();
            $userItem = array("id" => $waitList->current()->getUser()->getUserId(), "username" => $waitList->current()->getUser()->getUsername());
            array_push($useList, $userItem);
        }

        $response = array("Users" => $useList);

        //Return result as JSON
        return new Response(json_encode($useList));
    }

    /**
     * @Route("/tutorials/tutor/rooms/{roomToken}/wait", name="tutorial_room_tutor_wait", requirements={"roomToken": ".{1,100}"})
     */
    public function roomTutorWaitAction($roomToken)
    {
        $em = $this->getDoctrine()->getManager('user_conn');
        $room = $em->getRepository('AppBundle:TutorialRoomTable')->findOneBy(array('accessToken' => $roomToken));

        $user = $this->get('security.token_storage')->getToken()->getUser();

        $uid = $user->getUserId();

        if(!$user)
        {
            // TODO: Big error in authentication, throw error
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'A problem has occured.'));
        }

        if(!$room)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Room does not exist.'));
        }

        $tuteSess = $em->getRepository('AppBundle:TutorSession')->findOneBy(array('sessId' => $room->getRoomId()));
        $tutor = $tuteSess->getTutorId();

        if($user->getUserId() != $tutor->getUserId())
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'You are not the tutor for this session.'));
        }

        $currTime = new \DateTime("now");

        //Check Times
        if($room->getExpiry() < $currTime)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Session has expired.'));
        }

        if($room->getStartTime())
        {
            if($room->getStartTime() + $room->getSessionLength() < $currTime)
            {
                return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Session has ended.'));
            }
            else
            {
                # TODO: Redirect to room.
            }
        }

        if(!$room->getHostJoin())
        {
            // Set the host join time in DB.
            $room->setHostJoin(new \DateTime("now"));
        }


        if(!$room->getServer())
        {
            $servers = $em->getRepository('AppBundle:TutorialServers')->findBy(array('isUp' => TRUE),array('numRooms' => 'ASC'));
            $room->setServer($servers[0]);
            $servers[0]->addRoom();
        }


        $em->flush();

        // Return the wait room template.
        return $this->render('tutorial/room-wait.html.twig', array('roomToken' => $roomToken));
    }

    /**
     * @Route("/tutorials/tutor/rooms/{roomToken}", name="tutorial_room_tutor", requirements={"roomToken": ".{1,100}"})
     */
    public function roomTutorAction($roomToken)
    {
        $em = $this->getDoctrine()->getManager('user_conn');
        $room = $em->getRepository('AppBundle:TutorialRoomTable')->findOneBy(array('accessToken' => $roomToken));

        $user = $this->get('security.token_storage')->getToken()->getUser();

        $uid = $user->getUserId();

        if(!$user)
        {
            // TODO: Big error in authentication, throw error
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'A problem has occured.'));
        }

        if(!$room)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Room ' . $roomToken . ' does not exist.'));
        }


        $roomServer = $room->getServer();
        $tuteSess = $em->getRepository('AppBundle:TutorSession')->findOneBy(array('sessId' => $room->getRoomId()));
        $tutor = $tuteSess->getTutorId();

        if($user->getUserId() != $tutor->getUserId())
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'You are not the tutor for this session.'));
        }

        //Host should not enter room directly, but rather waits in lobby.
        if(!$room->getHostJoin())
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Room entered before lobby.'));
        }

        $currTime = new \DateTime("now");

        //Check Times
        if($room->getExpiry() < $currTime)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Session has expired.'));
        }

        if($room->getStartTime())
        {
            if($room->getStartTime()->add(new \DateInterval('PT'.$room->getSessionLength().'S')) < $currTime)
            {
                return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Session has ended.'));
            }
        }
        else
        {
            // Set the tutorial start time if not done already.
            $room->setStartTime(new \DateTime("now"));
        }

        if(!$roomServer)
        {
            return $this->render('tutorial/room-error.html.twig', array('errorInfo' => 'Server not assigned.'));
        }

        $serverToken = $roomServer->getEndPoint();

        $em->flush();

        // Return the tutorial room template for tutors.
        $session = $this->get('session');
        $sessId = $session->getId();
        return $this->render('tutorial/room.html.twig', array('roomToken' => $roomToken, 'serverToken' => $serverToken, 'sessionId' => $sessId, 'isHost' => true));
    }


    /**
     * @Route("/tutorials/admin/rooms/{roomToken}", name="tutorial_room_admin", requirements={"roomToken": ".{1,100}"})
     */
    public function roomAdminAction($roomToken)
    {
        $em = $this->getDoctrine()->getManager('user_conn');
        return $this->render('tutorial/room.html.twig', array('roomToken' => $roomToken));
    }
}
