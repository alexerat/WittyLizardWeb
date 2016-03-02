<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorSession
 *
 * @ORM\Table(name="Tutoring.Session_Invitation",
 * indexes={@ORM\Index(name="fk_Session_Invitation_Tutor_Session1_idx", columns={"Session_ID"}), @ORM\Index(name="fk_Session_Invitation_Tutee_Table1_idx", columns={"Tutee_ID"})})
 * @ORM\Entity
 */
class SessionInvitation
{

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\TutorSession")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Session_ID", referencedColumnName="Session_ID")
     * })
     */
    private $sessId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\Id
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutee_ID", referencedColumnName="User_ID")
     * })
     */
    private $tuteeId;

    /**
     * @var \DateTime
     *
     * @ORM\Column(name="Req_Time", type="datetime")
    */
    private $reqTime;


    /**
     * Set reqTime
     *
     * @param \DateTime $reqTime
     *
     * @return SessionInvitation
     */
    public function setReqTime($reqTime)
    {
        $this->reqTime = $reqTime;

        return $this;
    }

    /**
     * Get reqTime
     *
     * @return \DateTime
     */
    public function getReqTime()
    {
        return $this->reqTime;
    }

    /**
     * Set sessId
     *
     * @param \AppBundle\Entity\TutorSession $sessId
     *
     * @return SessionInvitation
     */
    public function setSessId(\AppBundle\Entity\TutorSession $sessId = null)
    {
        $this->sessId = $sessId;

        return $this;
    }

    /**
     * Get sessId
     *
     * @return \AppBundle\Entity\TutorSession
     */
    public function getSessId()
    {
        return $this->sessId;
    }

    /**
     * Set tuteeId
     *
     * @param \AppBundle\Entity\UserTable $tuteeId
     *
     * @return SessionInvitation
     */
    public function setTuteeId(\AppBundle\Entity\UserTable $tuteeId = null)
    {
        $this->tuteeId = $tuteeId;

        return $this;
    }

    /**
     * Get tuteeId
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getTuteeId()
    {
        return $this->tuteeId;
    }
}
