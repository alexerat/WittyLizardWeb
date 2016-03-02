<?php

namespace AppBundle\Entity;

use Doctrine\ORM\Mapping as ORM;

/**
 * TutorSession
 *
 * @ORM\Table(name="Tutoring.Tutor_Session", uniqueConstraints={@ORM\UniqueConstraint(name="Session_ID_UNIQUE", columns={"Session_ID"})},
 * indexes={@ORM\Index(name="fk_Tutor_Session_Tutorial_Room_Table1_idx", columns={"Room_ID"}), @ORM\Index(name="fk_Tutor_Session_Curriculum_Table1_idx", columns={"Curriculum_ID"}), @ORM\Index(name="fk_Tutor_Session_Tutor_Table1_idx", columns={"Tutor_ID"})})
 * @ORM\Entity
 */
class TutorSession
{

    /**
     * @var integer
     *
     * @ORM\Column(name="Session_ID", type="integer")
     * @ORM\Id
     * @ORM\GeneratedValue(strategy="IDENTITY")
    */
    private $sessId;

    /**
     * @var \AppBundle\Entity\UserTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\UserTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Tutor_ID", referencedColumnName="User_ID")
     * })
     */
    private $tutorId;

    /**
     * @var \AppBundle\Entity\TutorialRoomTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\TutorialRoomTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Room_ID", referencedColumnName="Room_ID")
     * })
     */
    private $roomId;

    /**
     * @var \AppBundle\Entity\CurriculumTable
     *
     * @ORM\ManyToOne(targetEntity="AppBundle\Entity\CurriculumTable")
     * @ORM\JoinColumns({
     *   @ORM\JoinColumn(name="Curriculum_ID", referencedColumnName="Curriculum_ID")
     * })
     */
    private $currId;

    /**
     * Get sessId
     *
     * @return integer
     */
    public function getSessId()
    {
        return $this->sessId;
    }

    /**
     * Set tutorId
     *
     * @param \AppBundle\Entity\UserTable $tutorId
     *
     * @return TutorSession
     */
    public function setTutorId(\AppBundle\Entity\UserTable $tutorId = null)
    {
        $this->tutorId = $tutorId;

        return $this;
    }

    /**
     * Get tutorId
     *
     * @return \AppBundle\Entity\UserTable
     */
    public function getTutorId()
    {
        return $this->tutorId;
    }

    /**
     * Set roomId
     *
     * @param \AppBundle\Entity\TutorialRoomTable $roomId
     *
     * @return TutorSession
     */
    public function setRoomId(\AppBundle\Entity\TutorialRoomTable $roomId = null)
    {
        $this->roomId = $roomId;

        return $this;
    }

    /**
     * Get roomId
     *
     * @return \AppBundle\Entity\TutorialRoomTable
     */
    public function getRoomId()
    {
        return $this->roomId;
    }

    /**
     * Set currId
     *
     * @param \AppBundle\Entity\CurriculumTable $currId
     *
     * @return TutorSession
     */
    public function setCurrId(\AppBundle\Entity\CurriculumTable $currId = null)
    {
        $this->currId = $currId;

        return $this;
    }

    /**
     * Get currId
     *
     * @return \AppBundle\Entity\CurriculumTable
     */
    public function getCurrId()
    {
        return $this->currId;
    }
}
