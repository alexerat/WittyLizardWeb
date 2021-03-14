<?php

namespace App\Controller;

use Symfony\Bundle\FrameworkBundle\Controller\Controller;

use App\Entity\UserTable;
use Symfony\Component\HttpFoundation\Request;
use Sensio\Bundle\FrameworkExtraBundle\Configuration\Route;

class TutorialController extends Controller
{
    /**
     * @Route("/tutors", name="tutor_market")
     */
    public function tutorMarketAction(Request $request)
    {

        $em = $this->getDoctrine()->getManager();
        $room = $em->getRepository('App:TutorialRoomTable')->findOneBy(array('accessToken' => $roomToken));

        $user = $this->get('security.token_storage')->getToken()->getUser();

        return $this->render('account/account_management.html.twig', array());
    }

    /**
     * @Route("/tutors/gettutorlist", name="tutor_market_list")
     */
    public function tutorListAction(Request $request)
    {

        // TODO: Return best tutors. Request may contain filters.
    }
}
